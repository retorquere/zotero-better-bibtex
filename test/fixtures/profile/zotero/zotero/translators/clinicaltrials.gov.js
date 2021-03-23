{
	"translatorID": "874d70a0-6b95-4391-a681-c56dabaa1411",
	"label": "clinicaltrials.gov",
	"creator": "Ryan Velazquez",
	"target": "^https://(www\\.)?clinicaltrials\\.gov/ct2/(show|results\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-12-13 03:28:31"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Ryan Velazquez

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	if (url.includes("/ct2/results?")) {
		Zotero.monitorDOMChanges(doc.querySelector("#theDataTable"));
		if (getSearchResults(doc, true)) {
			return "multiple";
		}
	}

	if (url.includes("/ct2/show")) {
		return "report";
	}

	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('table#theDataTable a[href*="/ct2/show"]');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function isJsonAPIRequest(url) {
	if (
		url.includes("https://clinicaltrials.gov/api/query")
	&& url.includes("fmt=JSON")
	) {
		return true;
	}
	else {
		return false;
	}
}

function isXmlAPIRequest(url) {
	if (
		url.includes("https://clinicaltrials.gov/api/query")
	&& url.includes("fmt=XML")
	) {
		return true;
	}
	else {
		return false;
	}
}

function getClinicalTrialID(url) {
	if (isXmlAPIRequest(url) || isJsonAPIRequest(url)) {
		return url.split("expr=")[1].split("&")[0];
	}
	else {
		return url.split("/show/")[1].split("?")[0];
	}
}

function dateTimeToDateString(dateTime) {
	return dateTime.split(" ")[0].split(":").join("-");
}

function scrape(doc, url) {
	const clinicalTrialID = getClinicalTrialID(url);
	let jsonRequestURL;
	if (!isJsonAPIRequest(url)) {
		jsonRequestURL = `https://clinicaltrials.gov/api/query/full_studies?expr=${clinicalTrialID}&fmt=JSON`;
	}
	else {
		jsonRequestURL = url;
	}

	ZU.doGet(jsonRequestURL, function (resp) {
		const data = JSON.parse(resp);
		var item = new Zotero.Item("report");
		const study = data.FullStudiesResponse.FullStudies[0].Study;
		item.itemType = "report";
		item.title = study.ProtocolSection.IdentificationModule.OfficialTitle;

		// Start get the creator info
		let creators = [];
		let responsiblePartyInvestigator;
		let sponsor;
		let collaborators = [];
		if (
			study.ProtocolSection.SponsorCollaboratorsModule.hasOwnProperty(
				"ResponsibleParty"
			)
		) {
			const responsibleParty
				= study.ProtocolSection.SponsorCollaboratorsModule.ResponsibleParty;
			if (
				typeof responsibleParty.ResponsiblePartyInvestigatorFullName == "string"
			) {
				responsiblePartyInvestigator
					= responsibleParty.ResponsiblePartyInvestigatorFullName;
				creators.push(
					ZU.cleanAuthor(responsiblePartyInvestigator, "author", false)
				);
			}
		}

		if (
			study.ProtocolSection.SponsorCollaboratorsModule.hasOwnProperty(
				"LeadSponsor"
			)
		) {
			sponsor
				= study.ProtocolSection.SponsorCollaboratorsModule.LeadSponsor
					.LeadSponsorName;
			let sponsorCreatorType;
			if (creators.length === 0) {
				sponsorCreatorType = "author";
			}
			else {
				sponsorCreatorType = "contributor";
			}
			creators.push({
				lastName: sponsor,
				creatorType: sponsorCreatorType,
				fieldMode: 1
			});
		}

		if (
			study.ProtocolSection.SponsorCollaboratorsModule.hasOwnProperty(
				"CollaboratorList"
			)
		) {
			const collaboratorList
				= study.ProtocolSection.SponsorCollaboratorsModule.CollaboratorList
					.Collaborator;
			collaboratorList.forEach((collaborator) => {
				collaborators.push({
					lastName: collaborator.CollaboratorName,
					creatorType: "contributor",
					fieldMode: 1
				});
			});
			collaborators.forEach((collaborator) => {
				creators.push(collaborator);
			});
		}

		item.creators = creators;
		// Done get the creator info

		item.date = study.ProtocolSection.StatusModule.LastUpdateSubmitDate;
		item.accessDate = dateTimeToDateString(data.FullStudiesResponse.DataVrs);
		item.institution = "clinicaltrials.gov";
		item.reportNumber = clinicalTrialID;
		item.shortTitle = study.ProtocolSection.IdentificationModule.BriefTitle;
		item.abstractNote = study.ProtocolSection.DescriptionModule.BriefSummary;
		item.url = "https://clinicaltrials.gov/ct2/show/" + clinicalTrialID;
		item.reportType = "Clinical trial registration";
		item.extra = `submitted: ${study.ProtocolSection.StatusModule.StudyFirstSubmitDate}`;
		item.complete();
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://clinicaltrials.gov/ct2/show/NCT04292899",
		"items": [
			{
				"itemType": "report",
				"title": "A Phase 3 Randomized Study to Evaluate the Safety and Antiviral Activity of Remdesivir (GS-5734™) in Participants With Severe COVID-19",
				"creators": [
					{
						"lastName": "Gilead Sciences",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "July 23, 2020",
				"abstractNote": "The primary objective of this study is to evaluate the efficacy of 2 remdesivir (RDV) regimens with respect to clinical status assessed by a 7-point ordinal scale on Day 14.",
				"extra": "submitted: February 28, 2020",
				"institution": "clinicaltrials.gov",
				"libraryCatalog": "clinicaltrials.gov",
				"reportNumber": "NCT04292899",
				"reportType": "Clinical trial registration",
				"shortTitle": "Study to Evaluate the Safety and Antiviral Activity of Remdesivir (GS-5734™) in Participants With Severe Coronavirus Disease (COVID-19)",
				"url": "https://clinicaltrials.gov/ct2/show/NCT04292899",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://clinicaltrials.gov/ct2/show/NCT00287391",
		"items": [
			{
				"itemType": "report",
				"title": "The Impact of Gastroesophageal Reflux Disease in Sleep Disorders: A Pilot Investigation of Rabeprazole, 20 mg Twice Daily for the Relief of GERD-Related Insomnia.",
				"creators": [
					{
						"lastName": "University of North Carolina",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "Janssen Pharmaceutica N.V., Belgium",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"date": "April 25, 2007",
				"abstractNote": "This study will investigate Gastroesophageal Reflux Disease (GERD)as a cause of sleep disturbance. Patients with GERD may experience all or some of the following symptoms: stomach acid or partially digested food re-entering the esophagus (which is sometimes referred to as heartburn or regurgitation) and belching. Even very small, unnoticeable amounts of rising stomach acid may cause patients to wake up during the night.\n\nThis study will also investigate the effect of Rabeprazole, (brand name Aciphex) on patients with known insomnia. Rabeprazole is an FDA approved medication already marketed for the treatment of GERD.",
				"extra": "submitted: February 3, 2006",
				"institution": "clinicaltrials.gov",
				"libraryCatalog": "clinicaltrials.gov",
				"reportNumber": "NCT00287391",
				"reportType": "Clinical trial registration",
				"shortTitle": "Sleep Disorders and Gastroesophageal Reflux Disease (GERD)",
				"url": "https://clinicaltrials.gov/ct2/show/NCT00287391",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://clinicaltrials.gov/ct2/show/NCT04261517?recrs=e&cond=COVID&draw=2",
		"items": [
			{
				"itemType": "report",
				"title": "Efficacy and Safety of Hydroxychloroquine for Treatment of COVID-19",
				"creators": [
					{
						"firstName": "Hongzhou",
						"lastName": "Lu",
						"creatorType": "author"
					},
					{
						"lastName": "Shanghai Public Health Clinical Center",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"date": "April 9, 2020",
				"abstractNote": "The study aims to evaluate the efficacy and safety of hydroxychloroquine in the treatment of COVID-19 pneumonia.",
				"extra": "submitted: February 6, 2020",
				"institution": "clinicaltrials.gov",
				"libraryCatalog": "clinicaltrials.gov",
				"reportNumber": "NCT04261517",
				"reportType": "Clinical trial registration",
				"url": "https://clinicaltrials.gov/ct2/show/NCT04261517",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
