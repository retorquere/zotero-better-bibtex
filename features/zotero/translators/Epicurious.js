{
	"translatorID": "aee2323e-ce00-4fcc-a949-06eb1becc98f",
	"label": "Epicurious",
	"creator": "Sean Takats",
	"target": "^https?://www\\.epicurious\\.com/(?:tools/searchresults|recipes/food/views)",
	"minVersion": "1.0.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2013-09-22 22:16:30"
}

function detectWeb(doc, url) {

	var xpath = '//div[@id="ingredients"]';
	var multxpath = '//div[@id="searchresults"]';

	if (doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "document";
	}
	// multiple disabled bc of permission issue
	else if (doc.evaluate(multxpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	}

}

function cleanText(s) {

	s = s.replace(/\n[\n\s]+/g, "\n");
	s = s.replace(/(\n|\r)\t+/g, "\n");
	s = s.replace(/\t+/g, " ");
	s = s.replace("        ", "", "g");
	return s;
}

function scrape(doc) {

	var newItem = new Zotero.Item("document");

	var xpath = '//h1';
	var title = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	title = Zotero.Utilities.trimInternal(title);
	//title = title.substring(0, title.indexOf(" Recipe at Epicurious.com"));
	newItem.title = title;

	var elmt;

	xpath = '//p[contains(@class, "source")]';
	var elmts = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
	if (elmt = elmts.iterateNext()) {
		var authordate = elmt.textContent.replace(/^by/i, "").trim();
		var authordates = authordate.split("|");
		newItem.creators.push(Zotero.Utilities.cleanAuthor(authordates[0], "contributor", true));
		var datestring = authordates[1].toString();
		Zotero.debug(datestring)
		datestring = datestring.replace("Copyright", "");
		newItem.date = datestring;
		while (elmt = elmts.iterateNext()) {
			Zotero.debug(elmt.textContent);
			if (elmt.textContent.replace(/\s*/, "") !=""){
				newItem.creators.push(Zotero.Utilities.cleanAuthor(elmt.textContent.replace(/^by/i, ""), "contributor", false));
			}	
			}
	}
	for (var i in newItem.creators){
		if (newItem.creators[i].firstName === ""){
			delete newItem.creators[i].firstName
		}
		if (!newItem.creators[i].firstName){
			newItem.creators[i].fieldMode = 1;
		}
	}

	xpath = '//div[@id="recipe_intro"]/p';
	if (elmt = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var abstract = elmt.textContent;
		abstract = Zotero.Utilities.trimInternal(abstract);
		newItem.abstractNote = abstract;
	}

	xpath = '//div[@id="ingredients"]';
	if (elmt = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var ingredients = elmt.textContent;
		ingredients = Zotero.Utilities.superCleanString(ingredients);
		ingredients = cleanText(ingredients);
	}
	xpath = '//div[@id="preparation"]';
	if (elmt = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var prep = elmt.textContent;
		prep = Zotero.Utilities.superCleanString(prep);
		prep = cleanText(prep);
		//prep = prep.replace(/\n/g, "\n\n");
	}
	xpath = '//div[@id="recipe_summary"]/p';
	if (elmt = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var serving = elmt.textContent;
		serving = Zotero.Utilities.superCleanString(serving);
		serving = cleanText(serving);
	}
	//	notestring = ingredients + "\n\n" + prep + "\n\n" + serving;
	//	newItem.notes.push({note:notestring});
	newItem.notes.push({
		note: ingredients
	});
	newItem.notes.push({
		note: prep
	});
	newItem.notes.push({
		note: serving
	});

	var url = doc.location.href;

	var snapshotURL = url.replace("/views/", "/printerfriendly/");
	newItem.attachments.push({
		title: "Epicurious.com Snapshot",
		mimeType: "text/html",
		url: snapshotURL,
		snapshot: true
	});
	newItem.url = url;
	newItem.attachments.push({
		title: "Epicurious.com Link",
		snapshot: false,
		mimeType: "text/html",
		url: url
	});

	newItem.complete();
}

function doWeb(doc, url) {
	var singxpath = '//div[@id="ingredients"]';
	var multxpath = '//div[@id="searchresults"]';
	if (doc.evaluate(singxpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		// single recipe page
		scrape(doc, url);
	} else if (doc.evaluate(multxpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var items = new Object();
		var urls = new Array();
		var elmtxpath = '//a[@class="recipeLnk"]';
		var elmts = doc.evaluate(elmtxpath, doc, null, XPathResult.ANY_TYPE, null);
		var elmt;
		while (elmt = elmts.iterateNext()) {
			var title = elmt.textContent;
			var link = elmt.href;
			if (title && link) {
				items[link] = title;
			}
		}

		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {

				urls.push(i);
			}
			Zotero.Utilities.processDocuments(urls, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();
		});

	}
} 

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.epicurious.com/recipes/food/views/Bitter-Orange-Creme-Brulee-361549",
		"items": [
			{
				"itemType": "document",
				"creators": [
					{
						"lastName": "Epicurious",
						"creatorType": "contributor",
						"fieldMode": 1
					},
					{
						"firstName": "Jeff",
						"lastName": "Morgan",
						"creatorType": "contributor"
					},
					{
						"firstName": "Domaine Chandon",
						"lastName": "Cookbook",
						"creatorType": "contributor"
					},
					{
						"lastName": "étoile",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"notes": [
					{
						"note": "Ingredients\nadd to shopping list\nFor the cookies (optional):\n3 large eggs, separated \n1/2 cup/100 g sugar, plus 2 tbsp\n1/2 tsp vanilla extract/essence\n1/2 cup/60 g all-purpose/plain flour \n3 tbsp confectioners'/icing sugar\nFor the crème brûlée:\n2 cups/480 ml heavy (whipping) / double cream\n1 cup/240 ml whole milk\nGrated zest from two oranges\n12 large egg yolks\n1/2 cup/100 g sugar, plus 6 tbsp/75 g\nSprigs of fresh mint or chocolate mint, for garnish"
					},
					{
						"note": "Preparation\nTo make the cookies (if using): \nPreheat the oven to 350°F/180°C/gas 4. Line a baking sheet/tray with parchment/baking paper. \nIn a large bowl, using an electric mixer, beat the egg yolks with the 1/2 cup sugar until the mixture turns pale yellow, about 1 minute. Add the vanilla and beat until the batter gets very thick, about 1 to 2 minutes longer. Using a rubber spatula, add the flour and mix slow and gently into the yolk mixture, just until it's barely incorporated. (It is important not to overmix; some of the flower should still be visible along the edges and in the center of the bowl.)\nIn a clean bowl, using the electric mixer and clean beaters, beat the egg whites with the 2 tbsp sugar until soft peaks form. Using the rubber spatula, gently fold the egg white mixture into the batter. Do not stir vigorously. \nUsing a ladle, in small batches if necessary, carefully scoop the batter into a pastry/piping bag with a size 4 tip. Pipe thin lines of batter about 3 in/7.5 cm long and 1/4 in/6 mm thick onto the prepared baking sheet/tray, spacing them about 1 in/25 mm apart. Use a sifter or fine-mesh sieve to dust the cookies with the confectioners'/icing sugar. \nBake until golden, 10 to 12 minutes. Remove the tray from the oven and let the cookies cool on the pan for about 1 minute to allow them to firm up a bit. Using a spatula, carefully transfer to a wire rack to cool completely. Repeat to use the remaining batter. You should have 25 to 30 cookies.\nTo make the crème brûlée:\nPreheat the oven to 300°F/150°C/gas 2. \nIn a medium saucepan, combine the cream, milk, and orange zest and heat until steam begins to rise. Do not let boil. Remove from the heat and nestle the pot in an ice bath. Let stand, stirring occasionally, until the cream mixture cools to room temperature, 5 to 10 minutes. \nWhile the cream mixture is cooling, in a large bowl, combine the egg yolks and the 1/2 cup/100 g sugar. Whisk until the sugar is dissolved and thoroughly blended with the yolks. Gently whisk in the cream mixture. \nPour the custard through a fine-mesh sieve set over a large glass measuring pitcher or bowl with a pouring lip to strain out any solids. Divide the custard evenly among six 4-oz/120-ml ramekins. Place in a roasting pan/tray and add water to come 1 in/2.5 cm up the sides of the ramekins. Bake until the custards are firm, 35 to 40 minutes. Remove from the oven and let cool in the water bath to room temperature. Cover with plastic wrap and refrigerate until well chilled, at least 2 hours and up to 2 days. \nTo serve, remove the plastic wrap/cling film and gently lay a paper towel/absorbent paper on top of each custard. Gently press down on the towel to remove any moisture buildup, being careful not to dent the custard. Sprinkle 1 tbsp sugar evenly over each custard. Using a blowtorch, pass the flame above the sugar until it melts and turns golden brown. (Alternatively, preheat the broiler/grill and slip the custards under the broiler 4 to 6 in/10 to 15 cm from the heat source to melt the sugar; leave the oven door open slightly and watch closely, as the sugar can scorch suddenly.) Let the crème brûlée stand at room temperature until the sugar hardens, 1 to 2 minutes. \nIf serving with the sugar cookies, lay 2 cookies over each custard, leaning them on the edge of the ramekins and garnish with mint. Serve at once. Enjoy any extra cookies the following day or with a sweet, dessert wine"
					},
					{
						"note": "yield\nServes 6"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Epicurious.com Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					},
					{
						"title": "Epicurious.com Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"title": "Bitter Orange Crème Brûlée",
				"date": "October 2010",
				"url": "http://www.epicurious.com/recipes/food/views/Bitter-Orange-Creme-Brulee-361549",
				"libraryCatalog": "Epicurious",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.epicurious.com/tools/searchresults?search=chocolate&x=0&y=0",
		"items": "multiple"
	}
]
/** END TEST CASES **/