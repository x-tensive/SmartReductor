using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xtensive.DPA.Common;
using Xtensive.DPA.Contracts;
using Xtensive.DPA.OPCUA;


public class OpcUASiemensDeviceTree : IOpcUADeviceConfigurationScript
{
    private OpcUaClient _client;

    private async Task<object> ReadPathInternal(OpcUaClient client, string path)
    {
        var nodes = await client.GetNodesByRoutes(path);
        var nodeId = nodes[path];
        var value = await client.ReadAsync(new OpcUaNodeQuery(nodeId));
        return value.Value;
    }

    private async Task<BrowseInfo> GetChildNode(BrowseInfo parent, string name)
    {
        return (await _client.BrowseAsync(parent.NodeId)).SelectMany(x => x).Single(x => x.BrowseName == name);
    }
    private async Task<IEnumerable<BrowseInfo>> GetChildNodes(BrowseInfo parent)
    {
        return (await _client.BrowseAsync(parent.NodeId)).SelectMany(x => x);
    }
    private async Task<T> GetValue<T>(BrowseInfo node)
    {
        var result = await _client.ReadAsync(new OpcUaNodeQuery(node.NodeId));
        return (T)result.Value;
    }
    private async Task<T> GetValue<T>(BrowseInfo parent, string name)
    {
        var child = await GetChildNode(parent, name);
        var result = await _client.ReadAsync(new OpcUaNodeQuery(child.NodeId));
        return (T)result.Value;
    }

    private async Task<OpcUaCNC> GetTree()
    {
        var cncNode = (await _client.BrowseRootAsync()).Where(n => n.DisplayName == "CNC").Single();
        var channNodes = await GetChildNode(cncNode, "channels");

        var axisNumbers = 0;
        var spindleNumbers = 0;
        var chanNumber = 1;

        var channels = new List<OpcUaDeviceInfo>();


        foreach (var channelNode in await GetChildNodes(channNodes)) {

            var childList = new List<OpcUaDeviceInfo>();
            foreach (var axesNode in await GetChildNodes(await GetChildNode(channelNode, "axes"))) {
                childList.Add(
                new OpcUaDeviceInfo {
                    Name = await GetValue<string>(axesNode, "name"),
                    Number = axisNumbers,
                    Class = DriverDeviceClass.Axis,
                    Attributes = new OpcUaDeviceAttributeInfo[] {
                                new OpcUaDeviceAttributeInfo{ Name="Channel", Value = channelNode.DisplayName, ValueType=TypeCode.String }
                                ,new OpcUaDeviceAttributeInfo{ Name="MaxSpeed", Value = (await GetValue<double>(axesNode, "maxSpeed")).ToString(), ValueType=TypeCode.Double }
                    }
                });
                axisNumbers++;
            }
            foreach (var axesNode in await GetChildNodes(await GetChildNode(channelNode, "spindles"))) {
                childList.Add(
                new OpcUaDeviceInfo {
                    Name = await GetValue<string>(axesNode, "name"),
                    Number = spindleNumbers,
                    Class = DriverDeviceClass.Spindle,
                    Attributes = new OpcUaDeviceAttributeInfo[] {
                                new OpcUaDeviceAttributeInfo{ Name="Channel", Value = channelNode.DisplayName, ValueType=TypeCode.String }
                    }
                });
                spindleNumbers++;
            }

            channels.Add(new OpcUaDeviceInfo {
                Name = await GetValue<string>(channelNode, "name"),
                Number = chanNumber,
                Class = DriverDeviceClass.Channel,
                Children = childList.ToArray(),
            });
            chanNumber++;

        }


        var rootDev = new OpcUaDeviceInfo {
            Name = await GetValue<string>(cncNode, "name"),
            Class = DriverDeviceClass.CNC,
            Number = 0,
            Children = channels.ToArray(),
            Attributes = new OpcUaDeviceAttributeInfo[] {
                    new OpcUaDeviceAttributeInfo{ Name = "SpindleCount", Value = spindleNumbers.ToString() , ValueType = System.TypeCode.UInt32}
                    , new OpcUaDeviceAttributeInfo{ Name = "AxisCount", Value = axisNumbers.ToString() , ValueType = System.TypeCode.UInt32}
                    , new OpcUaDeviceAttributeInfo{ Name = "Model", Value = await GetValue<string>(cncNode, "model") , ValueType = System.TypeCode.String}
                    , new OpcUaDeviceAttributeInfo{ Name = "DriverType", Value = await GetValue<string>(cncNode, "type") , ValueType = System.TypeCode.String}
                }
        };
        return new OpcUaCNC(rootDev);
    }

    public DeviceConfiguration Get(OpcUaClient client)
    {
        _client = client;
        var rootConfiguration = GetTree().Result;
        return new DeviceConfiguration(1, rootConfiguration);
    }
}
