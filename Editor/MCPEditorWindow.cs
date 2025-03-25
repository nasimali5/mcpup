using UnityEditor;
using UnityEngine.UIElements;
namespace MCP4Unity.Editor
{
    public class MCPEditorWindow : EditorWindow
    {
        public static MCPEditorWindow Inst;
        [MenuItem("Window/MCP Service Manager")]
        public static void ShowWindow()
        {
            Inst = GetWindow<MCPEditorWindow>();
        }
        Button startBtn;
        public void CreateGUI()
        {
            VisualElement root = rootVisualElement;
            Toggle toggle = new("Auto Start")
            {
                value = EditorPrefs.GetBool("MCP4Unity_Auto_Start", true)
            };
            toggle.UnregisterValueChangedCallback(OnToggle);
            root.Add(toggle);
            startBtn = new Button(OnClickStart) { text = "Start" };
            startBtn.style.height = 30;
            root.Add(startBtn);
            MCPService.OnStateChange += UpdateStartBtn;
            UpdateStartBtn();
        }
        void OnClickStart()
        {
            if (MCPService.Inst.Running)
            {
                MCPService.Inst.Stop();
            }
            else
            {
                MCPService.Inst.Start();
            }
        }

        void OnToggle(ChangeEvent<bool> evt)
        {
            EditorPrefs.SetBool("MCP4Unity_Auto_Start", evt.newValue);
        }
        public void UpdateStartBtn()
        {
            startBtn.text = MCPService.Inst.Running ? "Stop" : "Start";
            titleContent.text = "MCP:" + (MCPService.Inst.Running ? "Running" : "Stopped");
        }
    }

}
