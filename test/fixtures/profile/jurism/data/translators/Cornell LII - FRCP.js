{
    "target": "https?://(?:www.)law.cornell.edu/rules/frcp/rule_[-0-9]", 
    "creator": "Frank Bennett", 
    "browserSupport": "g", 
    "maxVersion": "", 
    "lastUpdated": "2016-02-13 06:36:58", 
    "label": "Cornell LII - FRCP", 
    "priority": 100, 
    "inRepository": true, 
    "translatorType": 4, 
    "minVersion": "1.0", 
    "translatorID": "97d6f922-9835-44c4-a3ac-bb039a2359a5"
}

function detectWeb(doc, url) {
    return "regulation";
}


function doWeb(doc, url) {
    var titleNode = doc.getElementsByTagName("title")[0];
    var title = titleNode.textContent;
    title = title.replace(/\s+\|.*/, "");
    var m = title.match(/^Rule\s+([.0-9]+)\.\s+(.*)/);
    var ruleNumber, ruleTitle;
    if (m) {
        ruleNumber = m[1];
        ruleTitle = m[2];
    }
    var year;
    var returnNodes = [];
    var contentBody = ZU.xpath(doc, "//div[@id='content1']");
    if (contentBody.length > 0) {
        contentBody = contentBody[0];
    } else {
        contentBody = false;
    }
    var item = new Zotero.Item("regulation");
    // Set title
    item.title = "Federal Rules of Civil Procedure";
    // Set section
    item.section = ruleNumber;
    // Set year -- last-listed year in source-credit node
    item.year = year;
    // Jurisdiction
    item.jurisdiction = "us";
    // Language
    item.language = "en";
    // Attachment
    if (contentBody) {
        // head (title and css)
        var head = doc.createElement("head");
        var titlenode = doc.createElement("title");
        head.appendChild(titlenode)
        titlenode.appendChild(doc.createTextNode("FRCP (Cornell LII): Rule " + ruleNumber + ": " + ruleTitle));
        
        var style = doc.createElement("style");
        head.appendChild(style)
        style.setAttribute("type", "text/css")
        var css = "*{margin:0;padding:0;}div.mlz-outer{width: 60em;max-width:95%;margin:0 auto;text-align:left;}body{text-align:center;}p{margin-top:0.75em;margin-bottom:0.75em;}div.mlz-link-button a{text-decoration:none;background:#cccccc;color:white;border-radius:1em;font-family:sans;padding:0.2em 0.8em 0.2em 0.8em;}div.mlz-link-button a:hover{background:#bbbbbb;}div.mlz-link-button{margin: 0.7em 0 0.8em 0;}p.statutory-body-1em{margin-left:1em;text-indent:1em;}p.statutory-body-2em{margin-left:2em;text-indent:1em;}p.statutory-body-3em{margin-left:3em;text-indent:1em;}span.smallcaps{font-variant:small-caps;}p.note-body{text-indent:1em;}p.note-head{font-weight:bold;text-align:center;}";
        style.appendChild(doc.createTextNode(css));
        
        var attachmentdoc = ZU.composeDoc(doc, head, contentBody);
        item.attachments.push( { title:"FRCP r. "+ruleNumber, document:attachmentdoc, snapshot:true } );
    }
    item.complete();
    Zotero.done();
}
