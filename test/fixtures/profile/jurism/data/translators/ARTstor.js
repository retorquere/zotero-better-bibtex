{
	"translatorID": "5278b20c-7c2c-4599-a785-12198ea648bf",
	"label": "ARTstor",
	"creator": "Charles Zeng & John Justin",
	"target": "^https?://([^/]+\\.)?(artstor|sscommons)\\.org/(open)?library",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2016-04-26 18:25:36"
}

/*
	Artstor Translator
	Copyright (C) Charles Zeng & John Justin

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.
	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/**
    detectWeb is run to determine whether item metadata can indeed be retrieved from the webpage. 
    The return value of this function should be the detected item type (e.g. “journalArticle”, 
    see the overview of Zotero item types), or, if multiple items are found, “multiple”. 
**/
function detectWeb(doc, url) {
    var itemType = false; // default - ignore

    if (url.search(/\/iv2\.|ExternalIV\.jsp/) != -1) {
        // Image viewer window
        itemType = "artwork";
    } else if (url.search(/\#3\|/) != -1) {
        // Thumbnail window page
        if ((doc.getElementsByClassName('MetaDataWidgetRoot') != null) &&
            (doc.getElementsByClassName('MetaDataWidgetRoot').length > 0)) {
            // There are multiple metadata windows visible
            itemType = "artwork";
        } else if ((doc.getElementById("floatingPlaceHolder") != null) &&
            (doc.getElementById("floatingPlaceHolder").style.display == "block")) {
            // Don't capture date if small window is present, ignore
        } else if ((doc.getElementById("thumbNavSave1") != null) &&
            (doc.getElementById("thumbNavSave1").style.display == "block")) {
            // Don't capture data if image group window is in editing state. Ignore
        } else if ((doc.getElementById("ssContentWrap") != null) &&
            (doc.getElementById("ssContentWrap").style.display == "inline")) {
            // Don't capture data if slide show window is present, ignore
        } else {
            // Allow thumbnail window.
            itemType = "multiple";
        }
    }
    // all other page, data can not be captured.
    return itemType;
}

/**
    Overall logic:
    - Detect the page context:
        - check if the page is main window (ignore)
        - check if the page is collection splash (ignore)
        - check if the page is a viewer
            - get the image id and type, process it.
        - check if the page is thumbnail page
            - ignore small window
			- check if metadata window is visisble. If so, get the image id from each 
				small window and process them
            - if no small window, get the selected object and process them
                get the object ids from selected objects, then process the ids.
            - otherwise, select all objects in the thumbnails and prompt user
                get the object ids from users, then process the ids.
    - Process the id
        - find the object type.
        - get the metadta service url from id using service call  [domain]/[approot]/secure/metadata/id
            - fetch and convert the metadata from the metadata service call
                - take into consideration of different metadata field for the portals
                - may need to convert/format the data values.
            - fetch the item notes using: 
        - get the resource link url from id: :[domain]/[approot]/secure/metadata/id?_method=FpHtml
            - fetch the resource from resource url
            - set the item title and item mine type.
    doWeb is run when a user, wishing to save one or more items, activates the selected translator. 
    Sidestepping the retrieval of item metadata, we'll first focus on how doWeb can be used to save 
    retrieved item metadata (as well as attachments and notes) to your Zotero library.
**/
function doWeb(doc, url) {
    if (url.match(/\/iv2\.|ExternalIV.jsp/)) {
        doImageViewer(doc, url);
    }
    if (url.match(/\#3\|/)) {
        // Thumbnail window page
        if ((doc.getElementsByClassName('MetaDataWidgetRoot') != null) &&
            (doc.getElementsByClassName('MetaDataWidgetRoot').length > 0)) {
            doMetadataWindow(doc, url);
        } else {
            doList(doc, url);
        }
    }
}
/**
	Process the thumbnail list by grabing the data from DOM
	and add it to the list for user to select.
	Once the items are selected, process them and add them to 
	Zotero.
**/
function doList(doc, url) {
    var visibleDomIdName = "custom";
    var zinfoDomNamePre = "custom";
    var zinfoDomNamePost = "_thumbMetaWrap";
    var selectDomIdNamePre = "custom";
    var selectDomIdNamePost = "_imageHolder";
    var candidateItems = new Object();
    var selectItems = new Object();

    if ((doc.getElementById("listContentWrap") != null) &&
        (doc.getElementById("listContentWrap").style.display == "block")) {
        // If list view is active.
        visibleDomIdName = "largeCustom";
        zinfoDomNamePre = "largeCustom";
        zinfoDomNamePost = "_MainArea";
        selectDomIdNamePre = "largeCustom";
        selectDomIdNamePost = "_imageHolder";
    }
    var i = 1;
    var found = true;
    do {
        var visibleDom = doc.getElementById(visibleDomIdName + i);
        if ((visibleDom != null) &&
            (visibleDom.style.display == "block")) {
            getDomData(doc, candidateItems, selectItems,
                zinfoDomNamePre + i + zinfoDomNamePost,
                selectDomIdNamePre + i + selectDomIdNamePost);
        } else {
            found = false;
        }
        i++;
    } while (found);

    if (Object.keys(selectItems).length > 0) {
        candidateItems = selectItems;
    }
    // Now we got candidate list, have user select it
    Zotero.selectItems(candidateItems, function(selectedItems) {
        var objItems = [];
        for (var objItem in selectedItems) {
            objItems.push(objItem);
        }
        processObjects(doc, url, objItems);
    });
}

/**
	Get the data from DOM and added it to candidateItems.
	If the item is selected, also adds it to the selectItems.
**/
function getDomData(doc, candidateItems, selectItems, zinfoName, selectName) {
    var zinfoDom = doc.getElementById(zinfoName);
    var selectDom = doc.getElementById(selectName);
    var ztitle = zinfoDom.getAttribute("ztitle");
    var zid = zinfoDom.getAttribute("zid");
    var ztid = zinfoDom.getAttribute("ztid");

    var key = zid + ":" + ztid;
    candidateItems[key] = htmlDecode(doc, ztitle);
    if (selectDom.className.indexOf("thumbNailImageSelected") > -1) {
        // The item is selected.
        selectItems[key] = htmlDecode(doc, ztitle);
    }
}

/**
	This procedure gets the image id and type from the DOM, added it to 
	the list and sends the list to processor.
**/
function doImageViewer(doc, url) {
    var objID = doc.getElementById("objID");
    if (objID != null) {
        var objItems = [];
        var objItem = objID.title;
        // Get the image id and object type from the title attribute.
        // This contains the objId and object type separate by : as in "AWSS35953_35953_25701160:11"
        objItems.push(objItem);
        processObjects(doc, url, objItems);
    }
}

/**
	Process the metadata window data by getting the ID from the 
	window DOM and retries data with extra calls.
**/
function doMetadataWindow(doc, url) {
    // get object id from metadata window.
    var metaWindows = doc.getElementsByClassName('MetaDataWidgetRoot');
    var objItems = [];
    for (var i = 0; i < metaWindows.length; i++) {
        // the dom id is in the form "mdwSS7730455_7730455_8806769" 
        // that is object id prefixed with mdw.
        var id = metaWindows[i].id.substring(3);
        objItems.push(id + ":10"); // default type to image
    }
    processObjects(doc, url, objItems);
}

/**
	This functions removes extra format tag from string and also decodes the
	html entity string.
**/
function htmlDecode(doc, input) {
    var fieldValue = input.replace(/<wbr\/>/g, "");
    fieldValue = fieldValue.replace(/<br\/>/g, "");

    return ZU.unescapeHTML(fieldValue);
}

/**
    processObjects gets the object data using service call.
    objIds has the following member: id, type
**/
function processObjects(doc, url, objIds) {
    for (var i = 0; i < objIds.length; i++) {
        var objItem = objIds[i];
        var dataItem = new Zotero.Item('artwork');
        dataItem.attachments.push({
            title: "Artstor Thumbnails",
            document: doc
        });

        getMetaDataItem(doc, url, objItem, dataItem);
    }
}

function getMetaDataItem(doc, url, objItem, dataItem) {
    var portalMap = {
        'flexspace': {
            'Campus': 'title',
            'Square Footage': 'artworkSize',
            'General Description': 'abstractNote',
            'Comments (Technology Integration)': 'abstractNote',
            'Rights': 'rights'
        },
        'archaeology': {
            'Site Name': 'title',
            'Artifact Title': 'title',
            'Artifact Description': 'abstractNote',
            'Artifact Repository': 'archive',
            'Site Date': 'date',
            'Artifact Materials/Techniques': 'artworkMedium',
            'Artifact Dimensions': 'artworkSize',
            'Rights': 'rights'
        },
        'default': {
            'Creator': 'creators',
            'Title': 'title',
            'Date': 'date',
            'Material': 'artworkMedium',
            'Measurements': 'artworkSize',
            'Repository': 'archive',
            'Rights': 'rights',
            'Description': 'abstractNote',
            'Accession Number': 'callNumber'
        }
    };

    var itemAry = objItem.split(':');
    var serviceUrl = getServiceUrlRoot(url) + "metadata/" + itemAry[0];
    Zotero.Utilities.HTTP.doGet(serviceUrl, function(text) {
        var json = JSON.parse(text);
        var portal = getPortal(url);
        if (!(portal in portalMap)) {
            portal = 'default';
        }
        processPortalData(doc, dataItem, json, portalMap[portal], portal);
        getNotesDataItem(url, objItem, dataItem);
    });
}

/**
	This procedure process the json, and add the json value to the 
	Zotero item.
**/
function processPortalData(doc, dataItem, json, fieldMap, portal) {
    var fieldName;
    var fieldValue;
    if (portal == 'archaeology') {
        var hasSiteName = false;
        for (var i = 0; i < json.metaData.length; i++) {
            fieldName = json.metaData[i].fieldName;
            fieldValue = htmlDecode(doc, json.metaData[i].fieldValue);
            if (fieldName in fieldMap) {
                var key = fieldMap[fieldName];
                if (fieldName == 'Site Name') {
                    hasSiteName = true;
                    setItemValue(dataItem, "title", fieldValue);
                } else if (fieldName == 'Artifact Title') {
                    if (hasSiteName) {
                        setItemLabelValue(doc, dataItem, "extra", fieldName, dataItem.title);
                        hasSiteName = false;
                    }
                    setItemValue(dataItem, "title", fieldValue);
                } else {
                    setItemValue(dataItem, key, fieldValue);
                }
            } else {
                setItemLabelValue(doc, dataItem, "extra", fieldName, fieldValue);
            }
        }

    } else {
        for (var i = 0; i < json.metaData.length; i++) {
            fieldName = json.metaData[i].fieldName;
            fieldValue = htmlDecode(doc, json.metaData[i].fieldValue);
            // fieldValue = json.metaData[i].fieldValue;
            if (fieldName in fieldMap) {
                var key = fieldMap[fieldName];
                if (key == 'creators') {
                    setItemCreator(dataItem, fieldValue);
                } else {
                    setItemValue(dataItem, key, fieldValue);
                }
            } else {
                setItemLabelValue(doc, dataItem, "extra", fieldName, fieldValue);
            }
        }
    }
    if (json.SSID !== undefined && json.SSID !== "") {
        setItemLabelValue(doc, dataItem, "extra", "SSID", json.SSID);
    }
    if (dataItem.title == undefined) {
        dataItem.title = "Unknown";
    }
}

function setItemCreator(dataItem, fieldValue) {
    var names = [];
    if (fieldValue.indexOf(';') > 0) {
        names = fieldValue.split(';');
    } else {
        names.push(fieldValue);
    }
    for (var i = 0; i < names.length; i++) {
        var str = names[i];
        var contributor = "author";
        var name = str;
        var value = name.replace(/<\/?[^>]+(>|$)/g, " ").replace(/(&gt;)|(&lt;)/g, "");
        dataItem.creators.push(ZU.cleanAuthor(value, contributor, false));
    }
}

function cleanStringValue(str) {
    var cleanValue = str.replace(/\<wbr\/\>/g, "");
    cleanValue = cleanValue.replace(/<\/?[^>]+(>|$)/g, " ");
    return cleanValue;
}

function setItemLabelValue(doc, dataItem, key, label, value) {
    var cleanValue = cleanStringValue(value);

    if (!(key in dataItem)) {
        dataItem[key] = label + ": " + cleanValue;

    } else {
        var fieldValue = dataItem[key];
        if (fieldValue.indexOf(label) >= 0) {
            dataItem[key] += ", " + cleanValue;
        } else {
            dataItem[key] += "; " + label + ": " + cleanValue;

        }
    }
}

function setItemValue(dataItem, key, value, override) {
    var cleanValue = cleanStringValue(value);

    if (!(key in dataItem) || override) {
        dataItem[key] = cleanValue;

    } else {
        dataItem[key] += "; " + cleanValue;
    }
}
/**
	This procedure makes the extra call to get the notes associated
	with the image records and add it to the Zotero data item.
**/
function getNotesDataItem(url, objItem, dataItem) {
    var itemAry = objItem.split(':');
    var objType = itemAry[1];
    var serviceURL = getServiceUrlRoot(url) + "icommentary/" + itemAry[0];
    Zotero.Utilities.HTTP.doGet(serviceURL,
        function(text) {
            var json = JSON.parse(text);
            for (var j = 0; j < json.numberOfCommentaries; j = j + 1) {
                if (json.ICommentary[j].status == 2) {
                    //public commentary
                    var comment = "";
                    if (json.ICommentary[j].ownerName == "") {
                        comment = "Note: ";
                    } else {
                        comment = "Note by: " + json.ICommentary[j].ownerName + " -  ";
                    }
                    comment += json.ICommentary[j].commentary;
                    dataItem.notes.push({
                        note: comment
                    });
                }
            }
            getResourceDataItem(url, objItem, dataItem);
        }
    ); //doGet

}

function getResourceDataItem(url, objItem, dataItem) {
    var itemAry = objItem.split(':');
    var serviceURL = getServiceUrlRoot(url) + "metadata/" + itemAry[0] + "/" + "?_method=FpHtml";

    Zotero.Utilities.HTTP.doGet(serviceURL, function(text) {
        var service = text.substring(text.indexOf("secure"));
        service = service.substring(0, service.indexOf("</td>")).replace(/<wbr\/>/g, "").substring(service.indexOf("?")).trim();
        dataItem.url = getServerUrl(url) + "/secure/ViewImages" + service + "&zoomparams=&fs=true";
        dataItem.complete();
    });
}

function getPortal(url) {
    var portal = url.substring(url.indexOf('://') + 3, url.indexOf('.'));
    return portal;
}

function getServerUrl(url) {
    var serverUrl;
    if (url.indexOf('/iv2.') > 0) {
        serverUrl = url.substring(0, url.indexOf('iv2.'));
    } else if (url.indexOf('/ExternalIV.jsp') > 0) {
        serverUrl = url.substring(0, url.indexOf('ExternalIV.jsp'));
    } else {
        serverUrl = url.substring(0, url.indexOf('#3'));
    }
    serverUrl = serverUrl.substring(0, serverUrl.lastIndexOf('/'));
    return serverUrl;
}

function getServiceUrlRoot(url) {
    var serviceRoot = getServerUrl(url) + "/secure/";
    return serviceRoot;

}

/** BEGIN TEST CASES **/
var testCases = [
    {
        "type": "artwork",
        "url": "http://www.sscommons.org/openlibrary/ExternalIV.jsp?objectId=4jEkdDElLjUzRkY6fz5%2BRXlDOHkje1x9fg%3D%3D&fs=true",
        "items": [
            {
                "itemType": "artwork",
                "title": "Trailer Home; Exterior view",
                "creators": [
                    {
                        "firstName": "Image by: Barbara",
                        "lastName": "Lane",
                        "creatorType": "author"
                    }
                ],
                "date": "Photographed: 2001",
                "extra": "Location: Bradford County, Pennsylvania; Collection: Bryn Mawr College Faculty/Staff/Student Photographs; ID Number: 01-07828; Source: Personal photographs of Professor Barbara Lane, 2001",
                "libraryCatalog": "ARTstor",
                "rights": "Copyright is owned by the photographer. Questions can be directed to sscommons@brynmawr.edu.; This image has been selected and made available by a user using Artstor's software tools. Artstor has not screened or selected this image or cleared any rights to it and is acting as an online service provider pursuant to 17 U.S.C. §512. Artstor disclaims any liability associated with the use of this image. Should you have any legal objection to the use of this image, please visit http://www.artstor.org/our-organization/o-html/copyright.shtml for contact information and instructions on how to proceed.",
                "url": "http://www.sscommons.org/openlibrary/secure/ViewImages?id=4jEkdDElLjUzRkY6fz5%2BRXlDOHkje1x9fg%3D%3D&userId=gDFB&zoomparams=&fs=true",
                "attachments": [
                    {
                        "title": "Artstor Thumbnails"
                    }
                ],
                "tags": [],
                "notes": [],
                "seeAlso": []
            }
        ]
    }
]
/** END TEST CASES **/

