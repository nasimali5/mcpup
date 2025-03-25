using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UnityEditor;
using UnityEngine;

namespace MCP4Unity.Editor
{
    [InitializeOnLoad]
    public class MCPService
    {
        public static MCPService Inst = new();
        public bool Running { get; private set; }
        private CancellationTokenSource _cancellationTokenSource;
        HttpListener HttpListener;

        public static Action OnStateChange;

        static MCPService()
        {
            if (EditorPrefs.GetBool("MCP4Unity_Auto_Start", true))
            {
                Inst.Start();
            }
        }

        public async void Start()
        {
            _cancellationTokenSource = new CancellationTokenSource();
            HttpListener = new HttpListener();
            HttpListener.Prefixes.Add("http://localhost:8080/mcp/");
            HttpListener.Start();
            Running = true;
            OnStateChange?.Invoke();
            while (!_cancellationTokenSource.Token.IsCancellationRequested)
            {
                var getContextTask = HttpListener.GetContextAsync();
                Task completedTask = await Task.WhenAny(getContextTask, Task.Delay(-1, _cancellationTokenSource.Token));
                if (_cancellationTokenSource.Token.IsCancellationRequested)
                    break;
                var httpContext = await getContextTask;
                _ = HandleHttpRequest(httpContext);
            }
            Running = false;
            OnStateChange?.Invoke();
        }

        public void Stop()
        {
            if (Running)
            {
                _cancellationTokenSource?.Cancel();
                if (HttpListener != null)
                {
                    if (HttpListener.IsListening)
                    {
                        HttpListener.Stop();
                    }
                    HttpListener.Close();
                    HttpListener = null;
                }
                Running = false;
                OnStateChange?.Invoke();
            }
        }

        private async Task HandleHttpRequest(HttpListenerContext context)
        {
            try
            {
                string requestBody = "";
                using (var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding))
                {
                    requestBody = await reader.ReadToEndAsync();
                }
                
                string responseContent =JsonConvert.SerializeObject(ProcessRequest(requestBody));
                
                context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                context.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
                
                byte[] buffer = System.Text.Encoding.UTF8.GetBytes(responseContent);
                context.Response.ContentLength64 = buffer.Length;
                context.Response.ContentType = "application/json";
                await context.Response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
            }
            catch (Exception ex)
            {
                Debug.LogError($"Error handling HTTP request: {ex.Message}");
                context.Response.StatusCode = 500;
            }
            finally
            {
                context.Response.Close();
            }
        }

        private MCPResponse ProcessRequest(string requestBody)
        {
            try
            {
                MCPRequest request = JsonConvert.DeserializeObject<MCPRequest>(requestBody);

                switch (request.method.ToLower())
                {
                    case "listtools":
                        return MCPResponse.Success(MCPFunctionInvoker.GetTools());
                    case "calltool":
                        ToolArgs toolArgs = JsonConvert.DeserializeObject<ToolArgs>(request.params_);
                        object res = MCPFunctionInvoker.Invoke(toolArgs.name, toolArgs.arguments);
                        return MCPResponse.Success(res);
                }
                return MCPResponse.Error($"unknown method:{request.method}") ;
            }
            catch (Exception ex)
            {
                Debug.LogError($"Error processing request: {ex.Message}");
                return MCPResponse.Error(ex);
            }
        }
    }
    public class MCPRequest
    {
        public string method;
        [JsonProperty("params")]
        public string params_;
    }
    public class ToolArgs
    {
        public string name;
        public JObject arguments;
    }

    public class MCPResponse
    {
        public bool success;
        public object result;
        public string error;

        public static MCPResponse Success(object result)
        { 
            return new MCPResponse
            {
                success = true,
                result = result
            };
        }

        public static MCPResponse Error(string error)
        {
            return new MCPResponse
            {
                success = false,
                error = error
            };
        }
        public static MCPResponse Error(Exception ex) => Error(ex.Message);
    }
}
