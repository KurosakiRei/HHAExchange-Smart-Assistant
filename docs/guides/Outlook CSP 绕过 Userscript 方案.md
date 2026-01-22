# **针对微软 Outlook.com 内容安全策略 (CSP) 的用户脚本注入技术与绕过方案深度研究报告**

## **摘要**

随着 Web 应用程序安全架构的日益复杂，特别是内容安全策略（Content Security Policy, CSP）在企业级应用中的广泛部署，传统的用户脚本（Userscript）注入技术面临前所未有的挑战。微软 Outlook.com 作为高价值的企业通信平台，实施了极其严格的 CSP 规则，包括基于随机数（Nonce）的脚本白名单、禁止内联脚本执行（unsafe-inline）以及严格的连接源限制（connect-src）。这些策略直接导致了基于 appendChild 或 innerHTML 的传统 Tampermonkey 脚本无法正常运行。本报告旨在为面临此类困境的开发者提供一份详尽的技术指南，系统性地分析 Outlook.com 的安全防御机制，并深入探讨利用 Tampermonkey 高级 API（如 GM\_addElement、GM\_xmlhttpRequest）及浏览器扩展特权上下文（Privileged Context）来合规、稳定地绕过 CSP 限制的成熟方案。报告还将涵盖 Shadow DOM 穿透、Manifest V3 对注入技术的影响以及不同浏览器内核（Chromium vs Firefox）下的差异化处理策略，最终提供一套经过验证的最佳实践代码模式。

## ---

**1\. 引言：用户定制化需求与企业级安全策略的博弈**

### **1.1 研究背景**

用户脚本（Userscripts）作为一种客户端侧的代码注入技术，长期以来被广泛用于增强 Web 应用的功能、优化用户界面以及自动化繁琐任务。Tampermonkey、Violentmonkey 等脚本管理器通过在网页加载过程中注入自定义 JavaScript 代码，赋予了用户对浏览器端体验的极大控制权。然而，随着 Web 安全形势的严峻化，跨站脚本攻击（XSS）成为主要的防御对象。

微软 Outlook.com 作为全球数亿用户使用的邮件服务平台，承载着大量的敏感个人与商业信息。为了防御 XSS 攻击和数据泄露，微软在 Outlook.com 上部署了极为严格的内容安全策略（CSP）。这种防御纵深（Defense in Depth）策略虽然有效提升了安全性，却也无意中构建了一道阻碍合法用户脚本运行的“高墙”。用户在编写针对 Outlook.com 的脚本时，常会遭遇控制台报错，如 Refused to execute inline script 或 Refused to load the script，导致脚本功能失效 1。

### **1.2 问题陈述**

本报告的核心议题在于解决以下技术冲突：

* **用户需求：** 在 Outlook.com 页面上下文中执行自定义 JavaScript 逻辑，修改 DOM 结构，或进行外部数据交互。  
* **安全约束：** Outlook.com 通过 HTTP 响应头强制执行 CSP，禁止未授权的脚本执行、禁止 eval()、禁止加载非白名单域名的资源，并严格限制网络请求的目标地址。

### **1.3 报告目标与范围**

本报告将超越简单的“代码片段”修复，旨在提供一个全面的技术框架。我们将：

1. **解构防御体系：** 深入剖析 Outlook.com 的 CSP 规则细节及其在浏览器渲染流水线中的执行机制。  
2. **评估绕过技术：** 对比分析 GM\_addElement、CSP Header 修改、Blob URL 注入、Shadow DOM 穿透等多种技术方案的有效性与稳定性。  
3. **提供成熟方案：** 基于 Tampermonkey 的 API 特性，构建一套在严格 CSP 环境下依然稳健运行的开发范式。  
4. **前瞻性分析：** 探讨 Chrome Manifest V3 (MV3) 标准对未来用户脚本生态的冲击及应对策略。

## ---

**2\. 深入剖析 Outlook.com 的内容安全策略 (CSP) 架构**

要寻找绕过限制的方案，首先必须深刻理解防御机制的运作原理。CSP 不是一个简单的开关，而是一套精细的权限控制语言，由服务器通过 HTTP Header 发送给浏览器，浏览器内核负责强制执行。

### **2.1 CSP 核心指令与 Outlook 的具体实现**

Outlook.com 的 CSP 策略是动态生成的，通常包含在 HTTP 响应头的 Content-Security-Policy 字段中。根据现有的研究数据和错误报告，其策略具有以下显著特征 3：

#### **2.1.1 script-src 与 Nonce 机制**

script-src 指令控制哪些脚本可以在页面上执行。在传统的宽松环境中，网站可能允许 'unsafe-inline'，这意味着任何 \<script\>...\</script\> 标签都可以执行。但在 Outlook.com 这种高安全级站点，'unsafe-inline' 通常被禁用，或者与 nonce（一次性加密随机数）结合使用。

Outlook 的典型策略如下所示（简化版）：

HTTP

Content-Security-Policy: script-src 'self' 'nonce-R4nd0mStr1ngBase64==' https://\*.office.net;

* **'self'**: 仅允许加载来自同源（outlook.live.com）的脚本文件。  
* **'nonce-...'**: 这是 CSP 的核心杀手锏。服务器在每次响应时生成一个唯一的随机字符串（Nonce）。只有当 HTML 中的 \<script\> 标签包含一个与 Header 中完全匹配的 nonce 属性时（例如 \<script nonce="R4nd0mStr1ngBase64=="\>...\</script\>），浏览器才会执行该脚本。  
* **阻断原理：** 用户脚本通常是静态编写的。当用户脚本尝试通过 document.body.appendChild(script) 注入一段代码时，该脚本标签要么没有 nonce 属性，要么无法预知当前页面请求的随机 nonce 值。浏览器检测到不匹配，立即拦截执行并抛出 CSP 违规错误 1。

#### **2.1.2 connect-src 与数据隔离**

connect-src 指令限制了页面可以通过 XHR、Fetch、WebSocket 等接口连接的目标域名。Outlook.com 几乎只允许连接微软自家的遥测和 API 服务（如 \*.office.com, \*.monitor.azure.com）。

* **阻断原理：** 如果用户的脚本尝试使用 fetch('https://api.my-dictionary.com') 来获取单词释义，浏览器会检查 connect-src 白名单。由于第三方域名不在白名单内，请求在网络层发出之前就会被浏览器终止 8。

#### **2.1.3 style-src 与内联样式**

尽管不如脚本限制严格，Outlook 依然对样式表来源进行控制。虽然通常保留 'unsafe-inline' 以支持通过 JS 动态修改样式，但在某些严格模式下（如高安全性的企业版 OWA），注入外部 CSS 文件也会受到阻碍 3。

### **2.2 微软的“安全未来计划” (Secure Future Initiative)**

值得注意的是，微软的安全策略并非一成不变，而是在持续收紧。根据微软 Entra ID（原 Azure AD）的最新公告，微软正在逐步淘汰允许未经授权脚本运行的任何宽松配置。这一计划被称为“安全未来计划”（SFI），其明确目标是阻止非受信任域的脚本在登录和核心交互页面上运行 6。

这意味着，依赖于“漏洞”或“配置疏忽”的绕过方法（例如尝试寻找未受保护的 iframe）将变得越来越不可靠。成熟的方案必须建立在浏览器扩展模型所赋予的合法特权之上，而不是试图欺骗浏览器的 CSP 解析器。

### **2.3 浏览器扩展与 CSP 的交互模型**

在 CSP 规范（W3C CSP Level 3）中，浏览器扩展（Extensions）处于一个特殊的地位。规范建议，由用户显式安装的扩展（包括 Tampermonkey）所注入的内容脚本（Content Scripts）不应受到页面 CSP 的严格限制，以免破坏扩展功能。然而，实际实现非常复杂：

1. **Isolated World（隔离世界）：** Chrome 和 Firefox 将扩展的内容脚本运行在一个与页面 JavaScript 隔离的环境中。在这个“隔离世界”里，脚本可以访问 DOM，但无法访问页面定义的全局变量（如 window.OutlookApp）。扩展自身的 CSP 适用于此环境，而不是页面的 CSP。  
2. **Main World Injection（主世界注入）：** 为了修改页面逻辑或访问页面变量，Tampermonkey 脚本经常需要将代码注入到页面的“主世界”中。一旦代码进入主世界（例如通过插入 \<script\> 标签），它就完全受制于页面的 CSP。这就是问题的根源 1。

## ---

**3\. 核心解决方案：基于 GM\_addElement 的特权注入**

针对用户“寻找成熟方案”的请求，经过对大量技术文档和社区实践的分析，**利用 Tampermonkey 提供的 GM\_addElement API 是目前最稳定、最合规且被广泛推荐的 CSP 绕过方案** 2。

### **3.1 方案原理：特权上下文的“漂白”作用**

GM\_addElement 是 Tampermonkey (及 Violentmonkey) 专门为解决 CSP 问题而引入的 API。其工作原理利用了浏览器扩展架构的一个关键特性：

当脚本使用 document.createElement 创建元素时，浏览器认为这是“页面行为”，因此应用页面的 CSP。  
当脚本调用 GM\_addElement 时，请求被发送给 Tampermonkey 的后台进程（Background Process）。Tampermonkey 随后利用其作为浏览器扩展的高级权限，将元素注入到 DOM 中。在 Chrome 和 Firefox 的安全模型中，由扩展程序直接发起的 DOM 注入通常会被视为“特权操作”，从而豁免于页面的 script-src 和 style-src 检查 1。  
这就像是通过一个拥有高级安全通行证的代理人（Tampermonkey）来把违禁品（用户脚本）带入严密防守的堡垒（Outlook），而不是自己直接闯关。

### **3.2 详细 API 使用指南与代码范式**

GM\_addElement 的函数签名如下：  
GM\_addElement(parent\_node, tag\_name, attributes)  
或  
GM\_addElement(tag\_name, attributes) (默认附加到 head 或 body) 14。

#### **场景一：注入内联 JavaScript 代码 (Inline Script)**

这是最常见的需求，用于在页面上下文中执行逻辑。

**传统（失败）方法：**

JavaScript

// 在 Outlook.com 上会被 CSP 拦截  
var script \= document.createElement('script');  
script.textContent \= 'console.log("Hello World");';  
document.body.appendChild(script);

**成熟方案（GM\_addElement）：**

JavaScript

// \==UserScript==  
// @name         Outlook CSP Bypass Demo  
// @match        https://outlook.live.com/\*  
// @grant        GM\_addElement  
// \==/UserScript==

(function() {  
    'use strict';  
      
    // 定义要执行的代码逻辑  
    const payload \= \`  
        console.log("CSP Bypass Success: Running in Main World");  
        // 这里可以访问 Outlook 的全局变量  
        if (window.owa) { console.log("OWA Object Detected"); }  
    \`;

    // 使用 API 注入  
    GM\_addElement(document.body, 'script', {  
        textContent: payload,  
        type: 'text/javascript'  
    });  
})();

**解析：** 此方法无需获取页面的 Nonce，因为注入动作由扩展发起，浏览器信任扩展的操作 14。

#### **场景二：加载外部依赖库 (External Library)**

如果脚本依赖 jQuery 或其他库，而该库的域名不在 Outlook 的 CSP 白名单中。

**成熟方案：**

JavaScript

// \==UserScript==  
// @name         Outlook jQuery Loader  
// @match        https://outlook.live.com/\*  
// @grant        GM\_addElement  
// \==/UserScript==

GM\_addElement('script', {  
    src: 'https://code.jquery.com/jquery-3.6.0.min.js',  
    type: 'text/javascript',  
    onload: () \=\> { console.log("jQuery loaded\!"); }  
});

**解析：** 扩展发起的资源加载请求通常不受页面 script-src 域名的限制，或者受到扩展自身 CSP 的管理（通常较宽松）17。

#### **场景三：样式注入 (Style Injection)**

虽然 GM\_addStyle 存在已久，但在处理 Shadow DOM 或极严格 CSP 时，GM\_addElement 提供了更细粒度的控制。

JavaScript

GM\_addElement(document.head, 'style', {  
    textContent: '.custom-button { background-color: red\!important; }'  
});

### **3.3 局限性与注意事项**

尽管 GM\_addElement 是目前最强大的工具，但在使用时仍需注意：

1. **事件处理器限制：** 即便脚本标签被注入了，如果你尝试在 HTML 元素上使用内联事件（如 \<button onclick="doSomething()"\>），页面的 CSP 依然可能阻止这个 onclick 的触发。**解决方案**是始终在 JavaScript 代码中使用 addEventListener 绑定事件，而不是依赖 HTML 属性 18。  
2. **Manifest V3 的不确定性：** 随着 Chrome 推进 Manifest V3，扩展的权限正在收缩。虽然目前的 Tampermonkey 版本在 MV3 下依然努力维持 GM\_addElement 的功能，但依赖浏览器底层的豁免机制未来可能存在变数。不过就目前而言，这是唯一可用的成熟 API 方案 13。

## ---

**4\. 网络通信的破局：GM\_xmlhttpRequest 深度解析**

Outlook.com 的 connect-src 策略通常极其封闭，只允许连接微软服务器。对于需要从第三方 API（如翻译服务、公司内部 CRM、Wiki 等）获取数据的脚本，标准的 fetch 或 XMLHttpRequest 必定失败。

### **4.1 跨域特权机制**

GM\_xmlhttpRequest 是 Greasemonkey/Tampermonkey 生态中历史最悠久也最重要的特权 API 之一。它的核心价值在于：**网络请求由扩展的后台脚本（Background Script）发起，而非当前页面。**

这意味着：

1. **绕过 CSP connect-src：** 扩展的后台环境不受页面 CSP 限制。  
2. **绕过 CORS (跨域资源共享) 限制：** 浏览器的同源策略（Same-Origin Policy）不适用于具有相应权限的扩展请求 9。

### **4.2 针对 Outlook 的实现方案**

在使用 GM\_xmlhttpRequest 时，必须在元数据块中声明 @connect 规则，这是 Tampermonkey 的安全机制，用于向用户申请跨域权限。

**代码范例：**

JavaScript

// \==UserScript==  
// @name         Outlook Translator Integration  
// @match        https://outlook.live.com/\*  
// @grant        GM\_xmlhttpRequest  
// @connect      api.deepl.com  
// @connect      my-custom-server.com  
// \==/UserScript==

(function() {  
    'use strict';

    function translateText(text) {  
        GM\_xmlhttpRequest({  
            method: "POST",  
            url: "https://api.deepl.com/v2/translate",  
            data: "text=" \+ encodeURIComponent(text) \+ "\&target\_lang=ZH",  
            headers: {  
                "Content-Type": "application/x-www-form-urlencoded"  
            },  
            onload: function(response) {  
                console.log("Translation received:", response.responseText);  
                // 处理返回数据并更新 Outlook UI  
            },  
            onerror: function(err) {  
                console.error("CSP Bypass Failed?", err);  
            }  
        });  
    }  
})();

**关键点：**

* **@connect 必不可少：** 如果不写 @connect，Tampermonkey 会拦截请求并提示用户授权，这在某些自动化场景下会导致失败。明确声明域名是最佳实践 9。  
* **Cookie 处理：** 默认情况下，GM\_xmlhttpRequest 不会发送 Outlook 域下的 Cookie，这反而是一种优势，避免了将用户的 Outlook 会话凭证泄露给第三方。如果需要携带第三方站点的 Cookie，可以配置 cookie 属性（视浏览器支持情况而定）。

## ---

**5\. 高级挑战：Shadow DOM 穿透与 React 应用架构**

Outlook Web App (OWA) 是一个高度复杂的单页应用（SPA），广泛使用了 React 框架，并在部分组件中采用了 Shadow DOM 技术来隔离样式和结构。这给脚本注入带来了双重困难：CSP 限制了注入，而 Shadow DOM 限制了查找。

### **5.1 Shadow DOM 下的样式注入困境**

标准的 GM\_addStyle 通常将 \<style\> 标签追加到文档的 \<head\> 中。然而，全局样式无法穿透 Shadow Root 的边界影响内部元素。要在 Shadow DOM 内部应用样式，必须将样式标签直接注入到 Shadow Root 内部 23。

结合 CSP 限制，这里必须再次使用 GM\_addElement，并将 parent\_node 设置为 Shadow Root 对象。

**成熟方案：**

JavaScript

// 假设我们要修改 Outlook 阅读窗格内的某个 Shadow DOM 元素  
const shadowHost \= document.querySelector('owa-reading-pane');  
if (shadowHost && shadowHost.shadowRoot) {  
    // 穿透 Shadow DOM 并注入样式，同时绕过 CSP  
    GM\_addElement(shadowHost.shadowRoot, 'style', {  
        textContent: '.email-body { font-size: 18px\!important; }'  
    });  
}

### **5.2 React 动态渲染的对抗策略**

Outlook 的页面内容是动态加载的。脚本运行初期，目标元素可能尚不存在。简单的 setTimeout并不可靠。

最佳实践：MutationObserver  
在严格 CSP 环境下，MutationObserver 是完全合规的，因为它只是监听 DOM 变化，不涉及代码执行。

JavaScript

const observer \= new MutationObserver((mutations) \=\> {  
    // 检查是否有关心的元素出现  
    const target \= document.querySelector('div.files-view');  
    if (target) {  
        // 执行注入逻辑  
        injectMyButton(target);  
        // 避免重复注入的逻辑...  
    }  
});

observer.observe(document.body, { childList: true, subtree: true });

此模式结合 GM\_addElement，构成了在现代动态网页上运行用户脚本的标准范式 26。

## ---

**6\. 浏览器差异性分析与特殊配置**

由于浏览器内核对 WebExtensions 标准的实现存在差异，脚本在 Chrome、Edge 和 Firefox 上的表现可能截然不同。

### **6.1 Firefox 的 USERSCRIPT\_WORLD 优势**

Firefox 在用户脚本支持方面处于领先地位。自 Firefox 80+ 版本起，引入了 USERSCRIPT\_WORLD 概念，允许脚本在与页面隔离但在权限上更接近的上下文中运行。

在 Tampermonkey 设置中，或者在脚本头部使用 @sandbox JavaScript，可以指示 Firefox 在这个特殊沙箱中运行脚本。

* **优点：** 这个环境往往能自动绕过大部分 CSP 限制，无需复杂的 GM\_addElement 也能直接操作 window 对象（通过 unsafeWindow）。  
* **配置：**  
  JavaScript  
  // @sandbox JavaScript

  此指令在 Firefox 上效果显著，但在 Chrome 上会回退到默认行为，因此建议作为一种增强配置，而非唯一依赖 13。

### **6.2 Chrome/Edge 与 Manifest V3 的阴影**

Chrome 正在强制推行 Manifest V3，这极大限制了扩展修改 HTTP Header 的能力。

* **"修改 CSP 头" 设置的消亡：** 过去，Tampermonkey 提供了一个设置选项“修改现有内容安全策略 (CSP) 头”（Modify existing content security policy headers）。它通过 webRequestBlocking API 移除页面响应中的 CSP 头，从而彻底解除限制。  
* **现状：** 在 MV3 中，这种能力被极大削弱甚至移除。Tampermonkey 作者明确表示，未来版本（特别是 Chrome 平台）将无法支持 CSP 放宽功能 13。  
* **结论：** **绝不要依赖“修改 CSP 头”设置作为长期方案。** 这不仅是即将过时的技术，而且会通过移除整个 Outlook 的安全防御来通过降低用户安全性，是一种极不负责任的做法。

## ---

**7\. 综合数据对比与方案矩阵**

为了直观地展示各方案的优劣，以下表格总结了针对 Outlook.com 不同 CSP 限制的应对策略。

### **表 1: CSP 指令与用户脚本绕过方案对照表**

| CSP 指令类型 | 限制内容 | 传统方法 (失败) | 成熟绕过方案 (推荐) | API 依赖 |
| :---- | :---- | :---- | :---- | :---- |
| **script-src** | 禁止无 Nonce 的脚本执行 | document.createElement('script') | **使用 GM\_addElement 注入** | GM\_addElement |
|  | 禁止 eval() | eval('code') / new Function() | 避免使用，改用静态函数或 Blob 注入 | N/A |
| **connect-src** | 禁止连接第三方 API | fetch() / xhr.open() | **使用 GM\_xmlhttpRequest** | GM\_xmlhttpRequest |
| **style-src** | 禁止非同源样式 | \<link href="..."\> | **使用 GM\_addElement 注入 \<style\>** | GM\_addElement |
| **worker-src** | 禁止创建 Worker | new Worker('blob:...') | 难以绕过，需用 GM\_addElement 注入 iframe 桥接 | GM\_addElement |

### **表 2: 注入模式对比**

| 注入模式 (Injection Mode) | 说明 | CSP 敏感度 | 适用场景 |
| :---- | :---- | :---- | :---- |
| **Page (Main World)** | 脚本直接在该页面上下文运行 | **极高 (完全受限)** | 需要与页面 JS 深度交互，但被 CSP 阻断 |
| **Content Script (Isolated)** | 脚本在隔离世界运行 | **中等** | DOM 操作，UI 修改。可通过 GM\_addElement 穿透 |
| **Instant** | 尽早在页面加载前运行 | **高** | 试图抢在 CSP 生效前运行 (Outlook 上通常无效) |

## ---

**8\. 结论与建议**

### **8.1 结论**

针对用户提出的在 Outlook.com 上运行 Tampermonkey 脚本遭遇 CSP 限制的问题，研究表明，试图直接对抗或移除 CSP 是一种不可持续且危险的做法。**成熟的解决方案在于利用浏览器扩展生态系统的特权机制，通过 GM\_addElement 进行 DOM 层面的合规注入，并通过 GM\_xmlhttpRequest 进行网络层面的数据交互。**

这种方法不仅在当前的浏览器版本（Manifest V2）中有效，也是 Tampermonkey 在即将到来的 Manifest V3 时代中主要支持的兼容路径。

### **8.2 最终推荐代码模板**

以下是一个集成了所有最佳实践的模板，建议用户基于此模板重构其脚本：

JavaScript

// \==UserScript==  
// @name         Outlook Professional Bypass Template  
// @namespace    http://tampermonkey.net/  
// @version      2.0  
// @description  A robust template for bypassing CSP on Outlook.com  
// @author       Expert Developer  
// @match        https://outlook.live.com/\*  
// @match        https://outlook.office.com/\*  
// @match        https://outlook.office365.com/\*  
// @grant        GM\_addElement  
// @grant        GM\_xmlhttpRequest  
// @connect      api.example.com  
// @run-at       document-end  
// \==/UserScript==

(function() {  
    'use strict';

    // 1\. 网络请求绕过 connect-src  
    // 使用 GM\_xmlhttpRequest 替代 fetch  
    const fetchData \= () \=\> {  
        GM\_xmlhttpRequest({  
            method: 'GET',  
            url: 'https://api.example.com/data',  
            onload: (res) \=\> {  
                console.log('Data fetched via privileged background:', res.responseText);  
                // 2\. DOM 操作绕过 script-src / style-src  
                // 数据获取后，更新 UI  
                updateUI(res.responseText);  
            }  
        });  
    };

    const updateUI \= (data) \=\> {  
        // 3\. 样式注入  
        // 不要使用 innerHTML \+= \<style\>...  
        GM\_addElement(document.head, 'style', {  
            textContent: '.my-custom-panel { background: \#0078d4; color: white; padding: 10px; }'  
        });

        // 4\. 元素注入  
        // 创建容器  
        const panel \= document.createElement('div');  
        panel.className \= 'my-custom-panel';  
        panel.textContent \= 'External Data: ' \+ data;  
          
        // 找到 Outlook 的插入点 (需配合 MutationObserver)  
        const container \= document.querySelector('\#app');  
        if (container) {  
            container.appendChild(panel);  
        }  
    };  
      
    // 启动逻辑  
    fetchData();

})();

通过采纳上述架构，开发者可以在尊重 Outlook.com 安全模型的前提下，实现用户脚本功能的完整交付，确保方案的长期稳定性与安全性。

#### **Works cited**

1. \[AskJS\] How does Tampermonkey manage to inject userscripts containing external dependencies? : r/javascript \- Reddit, accessed January 20, 2026, [https://www.reddit.com/r/javascript/comments/1olo21w/askjs\_how\_does\_tampermonkey\_manage\_to\_inject/](https://www.reddit.com/r/javascript/comments/1olo21w/askjs_how_does_tampermonkey_manage_to_inject/)  
2. Tampermonkey script blocked by a CSP error \- Stack Overflow, accessed January 20, 2026, [https://stackoverflow.com/questions/69786354/tampermonkey-script-blocked-by-a-csp-error](https://stackoverflow.com/questions/69786354/tampermonkey-script-blocked-by-a-csp-error)  
3. Manage your site's Content Security Policy | Microsoft Learn, accessed January 20, 2026, [https://learn.microsoft.com/en-us/power-pages/security/manage-content-security-policy](https://learn.microsoft.com/en-us/power-pages/security/manage-content-security-policy)  
4. Content security policy \- Power Platform \- Microsoft Learn, accessed January 20, 2026, [https://learn.microsoft.com/en-us/power-platform/admin/content-security-policy](https://learn.microsoft.com/en-us/power-platform/admin/content-security-policy)  
5. Clarity Content Security Policy | Microsoft Learn, accessed January 20, 2026, [https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-csp](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-csp)  
6. Content Security Policy (CSP) rollout in Microsoft Entra ID \- Microsoft identity platform, accessed January 20, 2026, [https://learn.microsoft.com/en-us/entra/identity-platform/content-security-policy](https://learn.microsoft.com/en-us/entra/identity-platform/content-security-policy)  
7. Microsoft to Block Unauthorized Scripts in Entra ID Logins with 2026 CSP Update, accessed January 20, 2026, [https://thehackernews.com/2025/11/microsoft-to-block-unauthorized-scripts.html](https://thehackernews.com/2025/11/microsoft-to-block-unauthorized-scripts.html)  
8. Why does Outlook Web media-src CSP block all media not hosted with Microsoft?, accessed January 20, 2026, [https://learn.microsoft.com/en-us/answers/questions/2285106/why-does-outlook-web-media-src-csp-block-all-media](https://learn.microsoft.com/en-us/answers/questions/2285106/why-does-outlook-web-media-src-csp-block-all-media)  
9. CSP connect-src Explained \- Content Security Policy, accessed January 20, 2026, [https://content-security-policy.com/connect-src/](https://content-security-policy.com/connect-src/)  
10. Cross site XMLHttpRequest Content Security Policy directive workaround? \- Stack Overflow, accessed January 20, 2026, [https://stackoverflow.com/questions/27576221/cross-site-xmlhttprequest-content-security-policy-directive-workaround](https://stackoverflow.com/questions/27576221/cross-site-xmlhttprequest-content-security-policy-directive-workaround)  
11. GM\_addElement node argument is not working in JavaScript \`@sandbox\` mode · Issue \#1657 \- GitHub, accessed January 20, 2026, [https://github.com/Tampermonkey/tampermonkey/issues/1657](https://github.com/Tampermonkey/tampermonkey/issues/1657)  
12. Safari: Script unable to bypass CSP · Issue \#296 \- GitHub, accessed January 20, 2026, [https://github.com/Tampermonkey/tampermonkey/issues/296](https://github.com/Tampermonkey/tampermonkey/issues/296)  
13. FAQ \- Tampermonkey, accessed January 20, 2026, [https://www.tampermonkey.net/faq.php?locale=en](https://www.tampermonkey.net/faq.php?locale=en)  
14. Bypassing CSP on Github? · Issue \#881 · Tampermonkey/tampermonkey, accessed January 20, 2026, [https://github.com/Tampermonkey/tampermonkey/issues/881](https://github.com/Tampermonkey/tampermonkey/issues/881)  
15. \`GM\_addElement\` missing · Issue \#1335 · violentmonkey/violentmonkey \- GitHub, accessed January 20, 2026, [https://github.com/violentmonkey/violentmonkey/issues/1335](https://github.com/violentmonkey/violentmonkey/issues/1335)  
16. Documentation \- Tampermonkey, accessed January 20, 2026, [https://www.tampermonkey.net/documentation.php?locale=en](https://www.tampermonkey.net/documentation.php?locale=en)  
17. How to load an image using userscript from another domain when script is on github, accessed January 20, 2026, [https://stackoverflow.com/questions/73563016/how-to-load-an-image-using-userscript-from-another-domain-when-script-is-on-gith](https://stackoverflow.com/questions/73563016/how-to-load-an-image-using-userscript-from-another-domain-when-script-is-on-gith)  
18. Greasemonkey Userscript Blocked by Content Security Policy \- Stack Overflow, accessed January 20, 2026, [https://stackoverflow.com/questions/63626288/greasemonkey-userscript-blocked-by-content-security-policy](https://stackoverflow.com/questions/63626288/greasemonkey-userscript-blocked-by-content-security-policy)  
19. Change link target to "\_self" for existing Click eventListener (which currently targets "\_blank"), accessed January 20, 2026, [https://stackoverflow.com/questions/74477658/change-link-target-to-self-for-existing-click-eventlistener-which-currently](https://stackoverflow.com/questions/74477658/change-link-target-to-self-for-existing-click-eventlistener-which-currently)  
20. While Manifest V3 extensions can't use code that isn't bundled with the extens... | Hacker News, accessed January 20, 2026, [https://news.ycombinator.com/item?id=27442403](https://news.ycombinator.com/item?id=27442403)  
21. How To Disable/Bypass Content-Security-Policy with Tampermonkey \- Stack Overflow, accessed January 20, 2026, [https://stackoverflow.com/questions/68869107/how-to-disable-bypass-content-security-policy-with-tampermonkey](https://stackoverflow.com/questions/68869107/how-to-disable-bypass-content-security-policy-with-tampermonkey)  
22. \[SECURITY\] \`GM\_download\` bypasses \`@connect\` security rules and includes credentials/cookies for all domains. · Issue \#2651 \- GitHub, accessed January 20, 2026, [https://github.com/tampermonkey/tampermonkey/issues/2651](https://github.com/tampermonkey/tampermonkey/issues/2651)  
23. Is there a way to use scripts in Shadow DOM with strict Content Security Policy?, accessed January 20, 2026, [https://stackoverflow.com/questions/39331408/is-there-a-way-to-use-scripts-in-shadow-dom-with-strict-content-security-policy](https://stackoverflow.com/questions/39331408/is-there-a-way-to-use-scripts-in-shadow-dom-with-strict-content-security-policy)  
24. GM\_addStyle does not work with the shadow DOM · Issue \#1059 \- GitHub, accessed January 20, 2026, [https://github.com/Tampermonkey/tampermonkey/issues/1059](https://github.com/Tampermonkey/tampermonkey/issues/1059)  
25. How to use GM\_addStyle in Tampermonkey on \#shadow-root (open)? \- Stack Overflow, accessed January 20, 2026, [https://stackoverflow.com/questions/60263139/how-to-use-gm-addstyle-in-tampermonkey-on-shadow-root-open](https://stackoverflow.com/questions/60263139/how-to-use-gm-addstyle-in-tampermonkey-on-shadow-root-open)  
26. mutationObserver on iframe doesn't seem to work in Firefox (ok in Chrome) \- Greasy Fork, accessed January 20, 2026, [https://greasyfork.org/en/discussions/development/68347-mutationobserver-on-iframe-doesn-t-seem-to-work-in-firefox-ok-in-chrome](https://greasyfork.org/en/discussions/development/68347-mutationobserver-on-iframe-doesn-t-seem-to-work-in-firefox-ok-in-chrome)  
27. Changes | Tampermonkey, accessed January 20, 2026, [https://www.tampermonkey.net/changelog.php?locale=en\&more=true\&show=fcmf](https://www.tampermonkey.net/changelog.php?locale=en&more=true&show=fcmf)  
28. \[CSP\] Modify existing content security policy not work · Issue \#1845 \- GitHub, accessed January 20, 2026, [https://github.com/Tampermonkey/tampermonkey/issues/1845](https://github.com/Tampermonkey/tampermonkey/issues/1845)