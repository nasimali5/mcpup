using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json.Linq;
using UnityEditor;
using UnityEngine;

namespace MCP4Unity.Editor
{
    [InitializeOnLoad]
    public class MCPFunctionInvoker
    {
        public static Dictionary<string, MCPTool> Tools = new();

        static MCPFunctionInvoker()
        {
            LoadMethods();
        }
        public static void LoadMethods()
        {
            Type[] types = GetDependentAssemblies().SelectMany(a => a.GetTypes()).ToArray();
            for (int i = 0; i < types.Length; i++)
            {
                MethodInfo[] methods = types[i].GetMethods(BindingFlags.Static| BindingFlags.Public);
                for (int j = 0; j < methods.Length; j++)
                {
                    HandleMethod(methods[j]);
                }
            }
        }
        static void HandleMethod(MethodInfo methodInfo)
        {
            MCPAttribute att = methodInfo.GetCustomAttribute<MCPAttribute>();
            if (att is ToolAttribute toolAttribute)
            {
                var mcpTool = new MCPTool(methodInfo, toolAttribute);
                Tools.Add(mcpTool.name, mcpTool);
            }
        }

        public static object Invoke(string functionName, JObject parameters)
        {
            if (Tools.TryGetValue(functionName, out var tool))
            {
                try
                {
                    Property[] properties = tool.inputSchema.properties.Values.ToArray();
                    object[] objects = new object[properties.Length];
                    for (int i = 0; i < properties.Length; i++)
                    {
                        Type type = properties[i].Type;
                        JToken jToken = parameters[properties[i].Name];
                        objects[i] = jToken.ToObject(type);
                    }
                    return tool.MethodInfo.Invoke(null, objects);
                }
                catch (Exception e)
                {
                    Debug.LogError(e);
                    return e.Message;
                }
            }
            return $"Tool {functionName} not found";
        }

        public static Tools GetTools()
        { 
            return new Tools
            {
                tools = Tools.Values.ToList()
            };
        }

        public static HashSet<Assembly> GetDependentAssemblies()
        {
            Assembly targetAssembly = typeof(ToolAttribute).Assembly;
            Assembly[] allAssemblies = AppDomain.CurrentDomain.GetAssemblies();
            HashSet<Assembly> dependentAssemblies =new ();

            foreach (Assembly assembly in allAssemblies)
            {
                if (assembly == targetAssembly)
                {
                    dependentAssemblies.Add(assembly);
                    continue;
                }
                try
                {
                    AssemblyName[] referencedAssemblies = assembly.GetReferencedAssemblies();
                    if (referencedAssemblies.Any(a => a.FullName == targetAssembly.FullName))
                    {
                        dependentAssemblies.Add(assembly);
                    }
                }
                catch (Exception ex)
                {
                    Debug.LogWarning($"Error checking references for assembly '{assembly.FullName}': {ex.Message}");
                }
            }

            return dependentAssemblies;
        }
    }
}
