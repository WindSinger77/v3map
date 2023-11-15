# V3Map 配置说明
V3Map通过配置参数来控制三维地图模型具体展现效果。主要体现在7个方面：全局环境，主体设置，边框，文本标签，图标标志，流光联动以及事件处理。

**注意实现：**
由于three.js并不直接接受Web Color的文本形式，例如#ffffff，所以需要对配置项中的颜色设置进行区分。本文中将通过Web Color和 [Three Color](https://threejs.org/docs/index.html#api/en/math/Color)来标识两种颜色形式。请使用的时候进行谨慎选择。

## 配置事例
```
{
    depth: 0.2,
    color: 0xeeeeee,
    opacity: 1,
    border: {
        show: true
    },
    dataLabel: {
        show: true,
        style: {
            color: "white",
            fontSize: "12px",
        }
    },
    dataMark: {
        show: true,
        url: "../assets/icon.png",
        scale: 0.4
    },
    flowing: {
        show: true,
        url: "../assets/flow.png",
        weight: 0.03,
        series: [
            {
                start: 330200,
                end: 330100
            },
            {
                start: 330300,
                end: 330100
            },
            {
                start: 330400,
                end: 330100
            },
            {
                start: 330500,
                end: 330100
            }
        ]
    },
    events: {
        select: {
            onSelect: (sender, event, feature) => {
                console.log(event);
            },
            depthDelta: 0.5,
            border: {
                color: 0xff0000,
                weight: 2
            }
        }
    }
}
```

## 详细说明
* 全局环境
* 主体设置
* 边框
* 文本标签
* 图标标志
* 流光联动
* 事件处理