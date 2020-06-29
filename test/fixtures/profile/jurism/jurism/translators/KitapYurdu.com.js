{
	"translatorID": "d3f35d5a-55da-4e07-be7d-b4d2a821279f",
	"label": "KitapYurdu.com",
	"creator": "Hasan Huseyin DER",
	"target": "^https?://www\\.kitapyurdu\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-09-16 08:49:18"
}

/*
	***** BEGIN LICENSE BLOCK *****

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
	if (url.indexOf('/kitap/')>-1||url.indexOf('product_id')>-1) {
		return 'book';
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[contains(@href, "/kitap/")]|//a[contains(@href, "product_id")]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
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
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


/*
remove titles from creators
*/

function cleanCreatorTitles(str){
	return str.replace(/Prof.|Doç.|Yrd.|Dr.|Arş.|Öğr.|Gör.|Çevirmen:|Editor:|Derleyici:/g, '');
}

function scrape(doc, url) {
	var item = new Zotero.Item("book");
	
	var title = doc.querySelector('[class=product-heading]');
	if (title) {
		item.title = ZU.trimInternal(title.textContent);
	}
	
	var authors = doc.querySelector('[class=manufacturers]');
	if (authors) {
		authors = ZU.trimInternal(authors.textContent);
		authors = authors.split(',');
		
			for (var i=0; i<authors.length; i++) {
				var creator = cleanCreatorTitles(authors[i]);
				item.creators.push(ZU.cleanAuthor(creator, "author"));
			}
			
	}

	
	var translators = ZU.xpath(doc, '//tr[contains(., "Çevirmen")]');
	for (var i=0; i<translators.length; i++) {
		var creator = cleanCreatorTitles(translators[i].textContent);
		item.creators.push(ZU.cleanAuthor(creator, "translator"));
	}
	
	var editors = ZU.xpath(doc, '//tr[contains(., "Editor")]|//tr[contains(., "Derleyici")]');
	for (var i=0; i<editors.length; i++) {
		var creator = cleanCreatorTitles(editors[i].textContent);
		item.creators.push(ZU.cleanAuthor(creator, "editor"));
	}
	
	var edition = doc.querySelector('[itemprop=bookEdition]');
	if (edition){
		edition = ZU.trimInternal(edition.textContent);
		//don't add first edition:
		if (edition.split('.')[0] != "1") {				
			item.edition = edition.split('.')[0];
		}
	}
	
	var language = ZU.xpathText(doc, '//tr/td[contains(., "Dil")]//following-sibling::td');
	if (language) {
		switch (language.trim()) {
			case "İNGİLİZCE":
				item.language = "en";
			default:
				item.language = "tr";
		}
	}
	
	var publisher = doc.querySelector('[itemprop=publisher]');
	if (publisher){
		publisher = ZU.trimInternal(publisher.textContent);
		if (item.language == "tr") {
			var words = publisher.split(' ');
			for (var i=0; i<words.length; i++) {
				words[i] = words[i][0] + words[i].substr(1).replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
			}
			item.publisher = words.join(' ');
		} else {
			item.publisher = ZU.capitalizeTitle(publisher, true);
		}
	}
	
	var date = doc.querySelector('[itemprop=datePublished]');
	if (date){
		item.date = ZU.trimInternal(date.textContent);
	}
	
	var isbn = doc.querySelector('[itemprop=isbn]');
	if (isbn){
		item.ISBN = ZU.trimInternal(isbn.textContent);
	}
	
	var numPages = doc.querySelector('[itemprop=numberOfPages]');
	if (numPages){
		item.numPages = ZU.trimInternal(numPages.textContent);
	}
	
	var abstractNote = doc.querySelector('[id=description_text]');
	if (abstractNote){
		item.abstractNote = ZU.trimInternal(abstractNote.textContent);
	}
	
	item.attachments.push({
		title: "Snapshot",
		document: doc
	});
		
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.kitapyurdu.com/kitap/makroekonomi/139156.html",
		"items": [
			{
				"itemType": "book",
				"title": "Makroekonomi",
				"creators": [
					{
						"firstName": "N. Gregory",
						"lastName": "Mankiw",
						"creatorType": "author"
					},
					{
						"firstName": "Ömer Faruk",
						"lastName": "Çolak",
						"creatorType": "translator"
					}
				],
				"date": "2009-10-30",
				"ISBN": "9786054160389",
				"abstractNote": "Gregory Mankiw’in Makroekonomi kitabı tüm dünya da ders kitabı olarak geniş kabul görmüştür. Kitap bugüne kadar altı baskı yaparken, başta Almanca, Fransızca, İtalyanca, İspanyolca, Çince, Rusça, Japonca ve Portekizce olmak üzere 16 dile çevrilmiştir. Elinizde tuttuğunuz Türkçe çeviride altıncı baskıdan yapılmıştır. Mankiw’in makroekonomi kitabını bu kadar önemli kılan nokta kitabın öğrenci ve öğretici dostu olmasıdır. Kitap makroekonomideki son gelişmeleri teorik olarak anlatırken ekonomideki gerçekleşmelere ilişkin verdiği örneklerle de teorik bilginin ayakları üzerine basmasını sağlamaktadır.Kitapta konular anlatıldıktan sonra her bölümün sonuna özet, anahtar kelimeler ile problemler ve uygulama soruları koyulmuştur. Kitaba sahip olan öğrenciler Eflatun Yayınevi’nin web sayfasına kayıt olup kitaptaki kodu girdiklerinde süresiz olarak kitaptaki sorular için istedikleri yardımı mail yoluyla alabileceklerdir. Böylece öğrenci, çalıştığı konular üzerinde kendisini interaktif hale getirmiş olacaktır.",
				"language": "tr",
				"libraryCatalog": "KitapYurdu.com",
				"numPages": "688",
				"publisher": "Efil Yayınevi",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.kitapyurdu.com/kitap/temel-ekonometri/22831.html",
		"items": [
			{
				"itemType": "book",
				"title": "Temel Ekonometri",
				"creators": [
					{
						"firstName": "Damodar N.",
						"lastName": "Gujarati",
						"creatorType": "author"
					},
					{
						"firstName": "Dawn",
						"lastName": "Porter",
						"creatorType": "author"
					},
					{
						"firstName": "Gülay Günlük",
						"lastName": "Şenesen",
						"creatorType": "translator"
					},
					{
						"firstName": "Ümit",
						"lastName": "Şenesen",
						"creatorType": "translator"
					}
				],
				"date": "2014-10-21",
				"abstractNote": "Temel Ekonometri’nin ilk baskısı otuz üç yıl önce yapılmıştı. Ekonometrinin hem kuramında hem uygulamasında önemli gelişmeler oldu. Her bir yeni basımında önemli gelişmeler kitaba yansımış ve kitap dünyanın bir çok üniversitesinde ders kitabı olarak kullanılmıştır.Bu kadar uzun ömürlü olan kitap iktisat ve finansman öğrencilerinin yanı sıra siyaset, kamu yönetimi, uluslararası ilişkiler, eğitim, tarım ve sağlık bilimlerinde de yaygın kullanılmaktadır.Yazar Gujarati’nin kitabın önsözünde yazdığı gibi: “Yıllar boyunca ekonometrinin, yeni başlayanlara, matris cebiri, yüksek matematik, giriş düzeyinin ötesinde istatistik kullanmadan, sezgisel ve anlaşılır biçimde öğretilebileceğini ilişkin olan kesin inancımı hiç değişmemiştir. Bazı konular özünde tekniktir. Böyle durumlarda ya uygun bir ek koydum ya da okuyucuyu ilgili kaynaklara yönlendirdim. O zaman bile teknik malzemeyi okuyucunun sezgisel anlayışını sağlayacak biçimde basitleştirmeye çalıştım. “Yeni basımda öğrenciler kitabın, konuları geliştirilmiş, somut örnekli yeni basımını çok yararlı bulacaktır. Bu basımda kitapta kullanılan gerçek verilerin konuyla ilgili ve güncel olmasına özen gösterilmiştir. Kitaba on beş yeni açıklayıcı örnekle otuzdan fazla bölüm sonu alıştırması eklenmiştir. Ayrıca daha önceki basımda yirmi beşe yakın örnek ve yirmiden çok alıştırmanın da verileri güncellenmiştir.Beşinci basımın çevirisinde kitapta Damodar Gujarati ile yeni ortak yazar Dawn Porter, ekonometrinin temellerini güncel araştırmalarla harmanladılar. Öğrencilere yönelik olarak da kitaptaki örneklerde kullanılan veri setleri bütün olarak Excel formatında hazırlanmıştır.Kitabın ilk bölümünde klasik modelin varsayımlarının genişletilmesini ele alıyor ve ardından çoklu doğrusallık, küçük örneklem, değişen varyans, ardışık bağımlılık, geleneksel ve almaşık ekonometrik modellemeler konularını beş bölümde inceleniyor. Daha sonra kitapta, gölge değişkenlerle regresyon, gölge bağımlı değişkenle regresyon, DOM, LOgit, Probit, Tobit modelleri, dinamik ekonometri modelleri, ardışık bağlanımlı ve gecikmesi dağıtılmış modeller anlatılıyor. Diğer bölümlerde eşanlı denklem modelleri konusu, zaman serileri ekonometrisi ele alınıyor. Durağanlık, birim kökler, eşbütünleşim konularının yanı sıra ABBHO ve VAB modelleriyle kestrim açıklanıyor.Ekonometri, özellikle de son yirmi-otuz yıldır bilgisayardaki kapasite ve hız artışlarıyla birlikte, hızlı bir gelişme gösteren, dolayısıyla sürekli yeni terimler doğuran bir bilim dalıdır. Bu nedenle çeviride, bu terimlerin Türkçe karşılıklarının kullanılmasına özen gösterilmiş ve olası bir karışıklığı önlemek için de, kitabın sonundaki Konu Dizini'nde her terimin hem Türkçe, hem İngilizce karşılıkları verilmiştir.İçindekiler;• Tek Denklemli Bağlamın (Regresyon) Modelleri• Bağlanım (Regresyon) Çözümlemesinin Niteliği• İki Değişkenli Bağlanım (Regresyon) Çözümlemesi: Bazı Temel Bilgiler• İki Değişkenli Bağlanım (Regresyon) Modeli: Tahmin Sorunu• Klasik Normal Doğrusal Bağlanım (Regresyon) Modeli (KNDBM)• İki Değişkenli Bağlanım (Regresyon)- Aralık Tahmini ve Önsav Sınaması• İki Değişkenli Doğrusal Bağlanım (Regresyon) Modelinin Uzantıları• Çoklu Bağlanım (Regresyon) Çözümlemesi: Tahmin Sorunu• Çoklu Bağlanım Çözümlemesi: Çıkarsama Sorunu• Yapay Değişkenlerle Bağlanım (Regresyon) Modelleri• Klasik Modelin Varsayımlarının Gevşetilmesi• Çoklu Doğrusallık: Açıklayıcı Değişkenler İlişkiliyse Ne Olur?• Değişen Varyans: Hata Varyansı Sabit Değilse Ne Olur?• Ardışık İlişki: Hata Terimleri İlişkiliyse Ne Olur?• Ekonometrik Modelleme: Model Kurma, Tanı Koyma Sınamaları",
				"edition": "5",
				"language": "tr",
				"libraryCatalog": "KitapYurdu.com",
				"numPages": "972",
				"publisher": "Literatür - Ders Kitapları",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.kitapyurdu.com/kitap/iktisadi-krizler-ve-turkiye-ekonomisi/375871.html",
		"items": [
			{
				"itemType": "book",
				"title": "İktisadi Krizler ve Türkiye Ekonomisi",
				"creators": [
					{
						"firstName": "",
						"lastName": "Kollektif",
						"creatorType": "author"
					},
					{
						"firstName": "Nadir",
						"lastName": "Eroğlu",
						"creatorType": "editor"
					},
					{
						"firstName": "İlhan",
						"lastName": "Eroğlu",
						"creatorType": "editor"
					},
					{
						"firstName": "Halil İbrahim",
						"lastName": "Aydın",
						"creatorType": "editor"
					}
				],
				"date": "2015-09-16",
				"ISBN": "9786055145545",
				"abstractNote": "Prof Dr. İlker Parasız'ın onlarca kitabı ve bilimsel çalışmaları iktisat bilimine, akademisyenlere, öğrencilere rehber olmuştur. Bu önemli çalışmaların pek çoğu iktisadi krizler üzerine kaleme alınmıştır. Bu armağan kitap da kıymetli bilim adamı İlker Hoca'ya bir minnet ve şükran ifadesi olarak hazırlanmıştır. Kitap 25 değişik üniversiteden ve Türkiye Cumhuriyet Merkez Bankası'ndan toplam 39 yazarın kaleme aldığı 28 makaleden ve dört bölüm başlığından oluşmaktadır. Kitapta iktisadi kriz konusu, teoriden pratiğe ve küresel boyuttan ulusal boyuta dizayn edilmeye çalışılmıştır. Üniversite ve kurum çeşitliliği, yazar portföyünün farklı bakış açılarına sahip akademisyenlerden oluşması bu çalışmanın en dikkat çeken özelliklerinden birisidir. Kitapta, krizlerin genel olarak nedenleri, özellikleri, yayılma yolları ile teorik ve kavramsal arka planı ve kriz kuramları tartışılmış, krizlerin çıkış nedenleri olarak teknoloji, politika, para ve banka ilişkilerinin yanı sıra ticaret ve sermaye ilişkileri de incelenmiş, liberal e Marksist görüşlerin ekonomik krizler hakkındaki yaklaşımları analiz edilmiştir. Dünyada yaşanan krizleri tarihsel perspektifte değerlendirmeyi amaçlayan bu kitap, daha çok günümüzde etkilerini devam ettiren 2008 küresel kriz üzerine yoğunlaşmakta, 2008'e kadar, 1929 krizi ile başlayan, petrol krizi, Latin Amerika, Asya ve Rusya krizlerini de derinlemesine analiz etmektedir. Özellikle, 2008 krizi, finansallaşma ve gelir adaletsiziliği ilişkisine vurgu yapmakta, yaşanan küresel kriz sonrası dünya ekonomisinin genel görünümü ve akabinde uygulanan iktisat politikalarını değerlenmektedir. Çalışmada ayrıca Türkiye'de yaşanan iktisadi krizler ile küresel krizlerinin Türkiye'ye etkilerini inceleme konusu yapılmaktadır. Ulusal ölçekte 1994 krizi bir başlıkta, 1994 sonrası dönem de 2000 ve 2001 krizi olarak iki ayrı başlıkta değerlendirilmektedir. 2008 krizi öncesi ve sonrası Türkiye ekonomisi ve 2008 krizi sonrası borç krizine yakalanan Avrupa Birliği'ndeki krizin Türkiye'ye yansımaları da ayrı makalelerde ele alınmaktadır. Kriz göstergeleri, krizden alınan dersler, risk yönetimi ve krize karşı alınacak uluslararası önlemlerle ilgili önemli makalelerin yer aldığı bu eserde risk yönetimi kavramı tartışılarak bilimsel bir temele oturtulmakta, kantitatif olarak kriz kriterleri kapsamında uluslararası işbirliği çerçevesinde yapılan G-20 toplantıları değerlendirmektedir. Kitap, iktisadi krizleri çok yönlü ele alarak bu konunun hem teorideki yerini hem de pratikteki yansımalarını yüksek öğrenimin ve konuya ilgi duyan diğer kesimlerin istifadesine sunmaktadır.",
				"language": "tr",
				"libraryCatalog": "KitapYurdu.com",
				"numPages": "661",
				"publisher": "Orion Kitabevi",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.kitapyurdu.com/kitap/ekonomi-politikasi--teori-ve-turkiye-uygulamasi/59581.html",
		"items": [
			{
				"itemType": "book",
				"title": "Ekonomi Politikası / Teori ve Türkiye Uygulaması",
				"creators": [
					{
						"firstName": "Mahfi",
						"lastName": "Eğilmez",
						"creatorType": "author"
					},
					{
						"firstName": "Ercan",
						"lastName": "Kumcu",
						"creatorType": "author"
					}
				],
				"date": "2013-11-26",
				"abstractNote": "İlk olarak 2002’de yayımlanan Ekonomi Politikası, bugüne kadar defalarca basıldı. Kitap, üniversitelerde ders kitabı olarak okutuldu, çeşitli mesleklere giriş sınavlarında temel soru kitapları arasında yer aldı. Yalnızca bir ders kitabı olmakla kalmadı, aynı zamanda ekonomi öğrenmek ve izlemek isteyenlerin de elkitabı haline geldi.Bu kez kitap, güncel gelişmeleri de kapsayacak biçimde yenidenyazıldı.Kitap, bu yapısıyla ekonomi ve işletme öğrencileri için olduğu kadar ekonomi konularını merak edenler için de vazgeçilmez bir başvuru kitabı olma özelliği taşıyor.",
				"edition": "18",
				"language": "tr",
				"libraryCatalog": "KitapYurdu.com",
				"numPages": "344",
				"publisher": "Remzi Kitabevi",
				"attachments": [
					{
						"title": "Snapshot"
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