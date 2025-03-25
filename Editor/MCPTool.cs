using System;
using System.Collections.Generic;
using System.Reflection;
using Newtonsoft.Json;

namespace MCP4Unity.Editor
{
    public class Property
    {
        [JsonIgnore]
        public Type Type;
        [JsonIgnore]
        public string Name;
        public string type;

        public string description;
        public Property(string name,Type type_)
        {
            Type = type_;
            Name = name;
            type = SharpTypeToTypeScriptType(type_);
        }
        public static string SharpTypeToTypeScriptType(Type type)
        {
            if (type == typeof(int) || type == typeof(float) || type == typeof(double) || type == typeof(decimal))
            {
                return "number";
            }
            else if (type == typeof(string))
            {
                return "string";
            }
            else if (type == typeof(bool))
            {
                return "boolean";
            }
            else if (type == typeof(DateTime))
            {
                return "string";
            }
            else if (type == typeof(void))
            {
                return "void";
            }
            else if (type == typeof(object))
            {
                return "any";
            }
            else if (type.IsGenericType)
            {
                Type genericTypeDefinition = type.GetGenericTypeDefinition();
                if (genericTypeDefinition == typeof(List<>))
                {
                    Type itemType = type.GetGenericArguments()[0];
                    return $"{SharpTypeToTypeScriptType(itemType)}[]";
                }
            }
            else if (type.IsArray)
            {
                Type elementType = type.GetElementType();
                return $"{SharpTypeToTypeScriptType(elementType)}[]";
            }
            return "any";
        }
    }

    public class InputSchema
    {
        public string type = "object";
        public Dictionary<string, Property> properties = new();
    }

    public class ToolResponse
    {
        public Content[] content;
        public bool isError;
    }
    public class Content
    {
        public string type = "text";
        public string text;
    }
    public class Tools
    {
        public List<MCPTool> tools = new();
    }
    public class MCPTool
    {
        public string name;
        public string description;
        public InputSchema inputSchema;
        public Property returns;
        [JsonIgnore]
        public MethodInfo MethodInfo;

        public MCPTool(MethodInfo methodInfo,ToolAttribute toolAttribute)
        {
            MethodInfo = methodInfo;
            name = methodInfo.Name.ToLower();
            description = toolAttribute.Desc;
            inputSchema = new();
            ParameterInfo[] parameters = methodInfo.GetParameters();
            for (int i = 0; i < parameters.Length; i++)
            {
                ToolAttribute toolAttribute_ = parameters[i].GetCustomAttribute<ToolAttribute>();
                Property property = new(parameters[i].Name, parameters[i].ParameterType);
                if (toolAttribute_ != null)
                {
                    property.description = toolAttribute_.Desc;
                }
                inputSchema.properties.Add(parameters[i].Name, property);
            }
            returns = new("return", methodInfo.ReturnType);
        }

    }



}
