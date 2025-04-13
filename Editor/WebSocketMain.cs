
using UnityEngine;
using NativeWebSocket;
using UnityEngine.Networking;
using System.Collections;
using SimpleJSON;
using System;
using Battle;
using UnityEngine.Playables;

public class WebSocketMain : MonoSingleton<WebSocketMain>
{
    private WebSocket websocket;
    private JSONNode connectJsNode;
    private JSONObject newestNoSendC2S;

    void Start()
    {
        Cmd.instance.Init();
    }

    public void GetHttpAccount2Session(string account)
    {
        StartCoroutine(IEGetHttpAccount2Session(account));
    }

    IEnumerator IEGetHttpAccount2Session(string account)
    {
        using (UnityWebRequest webRequest = new UnityWebRequest(AppConfig.Account2SessionURL, "POST"))
        {
            var account2SessionJsonnode = GetAccount2SessionData(account);
            byte[] postBytes = System.Text.Encoding.UTF8.GetBytes(account2SessionJsonnode.ToString());
            webRequest.uploadHandler = (UploadHandler)new UploadHandlerRaw(postBytes);
            webRequest.downloadHandler = (DownloadHandler)new DownloadHandlerBuffer();
            webRequest.SetRequestHeader("Content-Type", "application/json");

            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.ConnectionError)
            {
                Debug.Log($"==== {webRequest.error}");
            }
            else
            {
                ConnectWebSocket(webRequest.downloadHandler.text);
            }
        }
    }

    private JSONObject GetAccount2SessionData(string account)
    {
        JSONObject jsonNode = new JSONObject();

        return jsonNode;
    }

    async void ConnectWebSocket(string json)
    {
        connectJsNode = JSONNode.Parse(json);
        var connectData = connectJsNode["data"];

        DebugUtils.Log("Connect " + connectJsNode["msg"]);
        EventDispatcher<bool>.instance.TriggerEvent(EventName.Auth_Account_Finish);
        if (connectJsNode["code"].AsInt > 0)
        {
            EventDispatcher<bool>.instance.TriggerEvent(EventName.UI_ShowLoginWaitImg, false);
            if (UiMgr.IsOpenView<PopUpConfirmView>())
                return;

            PopUpConfirmMsg popUpConfirmMsg = ClassPool.instance.Pop<PopUpConfirmMsg>();
            popUpConfirmMsg.Content = connectJsNode["msg"];
            popUpConfirmMsg.Btn1Txt = "Cancel";
            popUpConfirmMsg.Btn2Txt = "OK";
            popUpConfirmMsg.showWaitImg = false;
            popUpConfirmMsg.Btn1Func = () =>
            {
                UiMgr.Close<PopUpConfirmView>();
            };

            popUpConfirmMsg.Btn2Func = () =>
            {
                UiMgr.Close<PopUpConfirmView>();
            };

            UiMgr.Open<PopUpConfirmView>(null, popUpConfirmMsg);

            return;
        }

        string hostWsPort = "ws://" + connectData["host"] + ":" + connectData["wsPort"];
        if (AppConfig.Account2SessionURL.Contains("https"))
        {
            hostWsPort = "wss://" + connectData["domain"] + "/wss" + connectData["wsPort"];
        }
        if (AppConfig.channelId == AppConfig.channelIdDiscord)
        {
        }
        websocket = new WebSocket(hostWsPort);

        websocket.OnOpen += () =>
        {
            var C2S_USER_LOGIN = new JSONObject();
            JSONObject data = new JSONObject();
            C2S_USER_LOGIN.Add("data", data);
            data.Add("uid", connectData["uid"].AsInt);
            Cmd.instance.C2S_USER_LOGIN(C2S_USER_LOGIN);
        };

        websocket.OnError += (e) =>
        {
            EventDispatcher<CmdEventData>.instance.TriggerEvent(EventName.networkAborted);
        };

        websocket.OnClose += (e) =>
        {

        };

        websocket.OnMessage += (bytes) =>
        {
            var message = System.Text.Encoding.UTF8.GetString(bytes);
            DeserializationJson(message);
        };
        await websocket.Connect();
    }

    private void DeserializationJson(string json)
    {
        var jsonNode = JSONNode.Parse(json);
        string cmd = jsonNode["cmd"];
        if (!cmd.Equals("S2C_USER_PONG"))
        if (Cmd.instance.S2CCmdDict.TryGetValue(cmd, out Action<JSONNode> jNode))
        {
            jNode(jsonNode);
        }
    }


    void Update()
    {
#if !UNITY_WEBGL || UNITY_EDITOR
        if(websocket != null)
            websocket.DispatchMessageQueue();
#endif

        Cmd.instance.Update();
    }

    public async void SendWebSocketMessage(JSONObject msg)
    {
        var cmd = msg["cmd"];
        if (!cmd.Equals("C2S_USER_PING") && !cmd.Equals("C2S_LOAD_DATA") && !cmd.Equals("C2S_USER_LOGIN"))
        {
            newestNoSendC2S = msg;
        }

        if (websocket.State == WebSocketState.Open)
        {
            if (!cmd.Equals("C2S_USER_PING"))
            {

            }
            await websocket.SendText(msg.ToString());
        }
        else if (websocket.State == WebSocketState.Aborted)
        {
            if (UiMgr.IsOpenView<PopUpConfirmView>())
                return;

            PopUpConfirmMsg popUpConfirmMsg = ClassPool.instance.Pop<PopUpConfirmMsg>();
            popUpConfirmMsg.Content = "You have been disconnected, please reconnect";
            popUpConfirmMsg.Btn1Txt = "Cancel";
            popUpConfirmMsg.Btn2Txt = "Reconnect";
            popUpConfirmMsg.showWaitImg = true;
            popUpConfirmMsg.Btn1Func = () =>
            {
            };

            popUpConfirmMsg.Btn2Func = () =>
            {
                ConnectWebSocket(connectJsNode.ToString());
            };

            UiMgr.Open<PopUpConfirmView>(null, popUpConfirmMsg);
        }
    }

    public void SendNewestNoSendC2S()
    {

        if (newestNoSendC2S != null)
            SendWebSocketMessage(newestNoSendC2S);

        newestNoSendC2S = null;
    }

    public void GetDiscordData(string json)
    {
        Main.instance.Fsm.OnStart<SceneLoginFsm>();

        var jsonNode = JSONNode.Parse(json);

        GameData.instance.DiscordPlayerName = jsonNode["userName"];
        GameData.instance.DiscordIconURL = jsonNode["iconUrl"];
        GameData.instance.DiscordPlayerId = jsonNode["id"];


        GetHttpAccount2Session(GameData.instance.DiscordPlayerId);

    }

    private IEnumerator IEGetIcon(JSONNode jsonNode)
    {
        GameData.instance.DiscordPlayerName = jsonNode["userName"];
        GameData.instance.DiscordIconURL = jsonNode["iconUrl"];
        GameData.instance.DiscordPlayerId = jsonNode["id"];

        using (UnityWebRequest webRequest = new UnityWebRequest(GameData.instance.DiscordIconURL, "Post"))
        {
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.ConnectionError)
            {
                Debug.Log(webRequest.error);
                yield break;
            }
            else
            {
                Texture2D texture = DownloadHandlerTexture.GetContent(webRequest);
                GetHttpAccount2Session(GameData.instance.DiscordPlayerId);


            }
        }
    }

    public void C2S_checkBattleVaild()
    {
        StartCoroutine("IEC2S_checkBattleVaild");
    }

    IEnumerator IEC2S_checkBattleVaild()
    {
        JSONObject jsonObj = new JSONObject();
        JSONObject jsonObj1 = new JSONObject();

        JSONArray jsonArr = new JSONArray();
        foreach (var item in GameData.instance.OpFramesDict)
        {
            var op = item.Value;
            JSONObject jsonObj2 = new JSONObject();
            jsonObj2.Add("frame", op.Frame);
            jsonObj2.Add("x", op.X); 
            jsonObj2.Add("y", op.Y);
            jsonObj2.Add("cardSkillId", op.CardSkillId);
            jsonArr.Add(jsonObj2);
        }

        jsonObj1.Add("opFrame", jsonArr);
        jsonObj.Add("data", jsonObj1);


        for (int i = 0; i < 20; i++)
        {
            using (UnityWebRequest webRequest = new UnityWebRequest(url, "Post"))
            {
                byte[] postBytes = System.Text.Encoding.UTF8.GetBytes(jsonObj1.ToString());
                webRequest.uploadHandler = (UploadHandler)new UploadHandlerRaw(postBytes);
                webRequest.downloadHandler = (DownloadHandler)new DownloadHandlerBuffer();
                webRequest.SetRequestHeader("Content-Type", "text/plain");//"application/json"

                yield return webRequest.SendWebRequest();
                if (webRequest.result == UnityWebRequest.Result.ConnectionError)
                {
                    Debug.Log(webRequest.error);
                }
                else
                {
                    Debug.Log(webRequest.result);
                }
            }
        }
    }

    private async void OnApplicationQuit()
    {
        await websocket.Close();
    }

}