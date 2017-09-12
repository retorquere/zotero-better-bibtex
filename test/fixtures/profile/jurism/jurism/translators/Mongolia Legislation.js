{
	"translatorID": "093ad11d-291f-4ed4-a406-23fd2a4de95f",
	"label": "Mongolia Legislation",
	"creator": "Frank Bennett",
	"target": "https?://(www.)*legalinfo.mn/law",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2013-07-24 08:59:33"
}

/*
 *******************
 * Global structures
 *******************
 */

var inputmap = {
    "Монгол Улсын хууль": {
        code: "27",
        itemType: "statute",
        english: "[Statutes]",
        boilerplate: {},
        children: {}
    },
    "Улсын Их Хурлын тогтоол": {
        code: "28",
        english: "[Resolutions of the state Great Khural]",
        itemType: "bill",
        boilerplate: {
            resolutionLabel: {
                mn: "Улсын Их Хурлын тогтоол",
                en: "Resolution of the Great Khural"
            }
        },
        children: {}
    },
    "Монгол Улсын олон улсын гэрээ": {
        code: "29",
        english: "[Mongolian international treaties]",
        itemType: "treaty",
        boilerplate: {},
        children: {
            "Гадаад харилцааг зохион байгуулах": {
                code: "138",
                english: "[Organizing International Relations]",
                boilerplate: {}
            },
            
            "Гэмт хэрэг болон терроризмтай хийх олон улсын тэмцэл": {
                code: "139",
                english: "[International Fight Against Terrorism and Crime]",
                boilerplate: {}
            },
            
            "Дипломат болон консулын эрх зүй": {
                code: "140",
                english: "[Diplomatic and Consular Law]",
                boilerplate: {}
            },
            
            "Зэвсэгт мөргөлдөөн ба олон улсын эрх зүй": {
                code: "141",
                english: "[Armed Conflict and International Law]",
                boilerplate: {}
            },
            
            "Нийгэм-соёлын салбарын олон улсын хамтын ажиллагаа": {
                code: "142",
                english: "[International Cooperation on Social-Cultural Issues]",
                boilerplate: {}
            },
            
            "Нутаг дэвсгэр": {
                code: "143",
                english: "[Territory]",
                boilerplate: {}
            },
            
            "Олон улсын агаарын эрх зүй": {
                code: "144",
                english: "[International Air Law]",
                boilerplate: {}
            },
            
            "Олон улсын аюулгүй байдлын эрх зүй": {
                code: "145",
                english: "[International Security Law ]",
                boilerplate: {}
            },
            
            "Олон улсын байгууллага ба холбоо": {
                code: "146",
                english: "[International Organizations and Associations]",
                boilerplate: {}
            },
            
            "Олон улсын гэрээний эрх зүй": {
                code: "147",
                english: "[International Treaty Law]",
                boilerplate: {}
            },
            
            "Олон улсын далайн эрх зүй": {
                code: "148",
                english: "International Law of the Sea",
                boilerplate: {}
            },
            
            "Олон улсын сансрын эрх зүй": {
                code: "149",
                english: "[International Law of Space]",
                boilerplate: {}
            },
            
            "Олон улсын харилцааны нийтлэг асуудал": {
                code: "150",
                english: "[Issues and Problems of International Relations]",
                boilerplate: {}
            },
            
            "Олон улсын шинжлэх ухаан техникийн хамтын ажиллагаа": {
                code: "151",
                english: "[International Cooperation in Science and Technology]",
                boilerplate: {}
            },
            
            "Олон улсын эдийн засгийн хамтын ажиллагаа": {
                code: "152",
                english: "[International Economic Cooperation]",
                boilerplate: {}
            },
            
            "Улсын эрх залгамжлал": {
                code: "153",
                english: "[Succession of State]",
                boilerplate: {}
            },
            
            "Хүн ам": {
                code: "154",
                english: "[Population]",
                boilerplate: {}
            },
            
            "Хүний эрхийн олон улсын хамгаалалт": {
                code: "155",
                english: "[International Protection of Human Rights]",
                boilerplate: {}
            },
            
            "Хүрээлэн буй орчны олон улсын эрх зүйн хамгаалалт": {
                code: "156",
                english: "[International Law Protecting the Environment]",
                boilerplate: {}
            },
            
            "Цэрэг, дайны асуудлаархи хамтын ажиллагаа": {
                code: "157",
                english: "[Military Cooperation and War]",
                boilerplate: {}
            }
        }
    },
    "Ерөнхийлөгчийн зарлиг": {
        code: "30",
        english: "[Decrees of the President]",
        itemType: "regulation",
        boilerplate: {
            regulationType: {
                mn: "Ерөнхийлөгчийн зарлиг",
                en: "Presidential Decree"
            }
        },
        children: {}
    },
    "Үндсэн хуулийн цэцийн шийдвэр": {
        code: "31",
        english: "[Decisions of the Constitutional Tsets]",
        itemType: "case",
        boilerplate: {
            court: {
                mn: "Үндсэн хуулийн цэц",
                en: "Constitutional Tsets"
            }
        },
        children: {
            "Тогтоол": {
                code: "тогтоол",
                english: "Resolution",
                boilerplate: {
                    supplementName: {
                        mn: "Тогтоол",
                        en: "Resolution"
                    }
                }
            },            
            "Дүгнэлт": {
                code: "дүгнэлт",
                english: "Decision",
                boilerplate: {
                    supplementName: {
                        mn: "Дүгнэлт",
                        en: "Decision"
                    }
                }
            }
        }
    },
    "Улсын дээд шүүхийн тогтоол": {
        code: "32",
        english: "[Resolutions of the Supreme Court]",
        itemType: "case",
        boilerplate: {
            supplementName: {
                mn: "Тогтоол",
                en: "Resolution"
            },
            court: {
                mn: "Дээд шүүх",
                en: "Supreme Court"
            }
        },
        children: {}
    },
    "Засгийн газрын тогтоол": {
        code: "33",
        english: "[Resolutions of the government]",
        itemType: "regulation",
        boilerplate: {
            regulationType: {
                mn: "Засгийн газрын тогтоол",
                en: "Resolution of Government"
            }
        },
        children: {}
    },
    "Сайдын тушаал": {
        code: "34",
        english: "Ministerial ordinances",
        itemType: "regulation",
        boilerplate: {
            regulationType: {
                mn: "Tушаал",
                en: "Ordinance"
            }
        },
        children: {
            "Гадаад харилцааны яам": {
                code: "95",
                english: "[Ministry of Foreign Affairs]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Гадаад харилцааны яам",
                        en: "Ministry of Foreign Affairs"
                    }
                }
            },

            "Сангийн яам": {
                code: "96",
                english: "[Ministry of Finance]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Сангийн яам",
                        en: "Ministry of Finance"
                    }
                }
            },

            "Хууль зүй, дотоод хэргийн яам": {
                code: "97",
                english: "[Ministry of Justice and Home Affairs]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Хууль зүй, дотоод хэргийн яам",
                        en: "Ministry of Justice and Home Affairs"
                    }
                },
                changes: {
                    "2012-06-01": {
                        variant: "Хууль зүйн яам",
                        boilerplate: {
                            regulatoryBody: {
                                mn: "Хууль зүйн яам",
                                en: "Ministry of Justice"
                            }
                        }
                    }
                }
            },

            "Байгаль орчин, аялал жуулчлалын яам": {
                code: "98",
                english: "[Ministry of Nature, Environment and Tourism]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Байгаль орчин, аялал жуулчлалын яам",
                        en: "Ministry of Nature, Environment and Tourism"
                    }
                },
                changes: {
                    "2012-06-01": {
                        variant: "Байгаль орчин, ногоон хөгжлийн яам",
                        boilerplate: {
                            regulatoryBody: {
                                mn: "Байгаль орчин, ногоон хөгжлийн яам",
                                en: "Ministry of Nature, Environment and Green Development"
                            }
                        }
                    }
                }
            },

            "Боловсрол, соёл шинжлэх ухааны яам": {
                code: "99",
                english: "[Ministry of Education, Culture and Science]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Боловсрол, соёл шинжлэх ухааны яам",
                        en: "Ministry of Education, Culture and Science"
                    }
                },
                changes: {
                    "2012-06-01": {
                        variant: "Батлан хамгаалах яам",
                        boilerplate: {
                            regulatoryBody: {
                                mn: "Батлан хамгаалах яам",
                                en: "Ministry of Defence"
                            }
                        }
                    }
                }
            },

            "Боловсрол, шинжлэх ухааны яам": {
                code: "100",
                english: "[Ministry of Education and Science]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Боловсрол, шинжлэх ухааны яам",
                        en: "Ministry of Education and Science"
                    }
                }
            },

            "Зам тээвэр, аялал жуулчлалын яам": {
                code: "101",
                english: "[Ministry of Roads, Transportation and Tourism]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Зам тээвэр, аялал жуулчлалын яам",
                        en: "Ministry of Roads, Transportation and Tourism"
                    }
                },
                changes: {
                    "2012-06-01": {
                        variant: "Зам тээвэрийн яам",
                        boilerplate: {
                            regulatoryBody: {
                                mn: "Зам тээвэрийн яам",
                                en: "Ministry of Road and Transportation"
                            }
                        }
                    }
                }
            },

            "Нийгмийн хамгаалал, хөдөлмөрийн яам": {
                code: "102",
                english: "[Ministry of Social Welfare and Labor]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Нийгмийн хамгаалал, хөдөлмөрийн яам",
                        en: "Ministry of Social Welfare and Labor"
                    }
                },
                changes: {
                    "2012-06-01": {
                        variant: "Хөдөлмөрийн яам",
                        boilerplate: {
                            regulatoryBody: {
                                mn: "Хөдөлмөрийн яам",
                                en: "Ministry of Labor"
                            }
                        }
                    }
                }
            },

            "Эрдэс баялаг, эрчим хүчний яам": {
                code: "103",
                english: "[Ministry of Mineral Resources and Energy]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Эрдэс баялаг, эрчим хүчний яам",
                        en: "Ministry of Mineral Resources and Energy"
                    }
                }
            },

            "Хүнс, хөдөө аж ахуй, хөнгөн үйлдвэрийн яам": {
                code: "104",
                english: "[Ministry of Food, Agriculture and Light Industry]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Хүнс, хөдөө аж ахуй, хөнгөн үйлдвэрийн яам",
                        en: "Ministry of Food, Agriculture and Light Industry"
                    }
                }
            },

            "Барилга, хот байгуулалтын яам": {
                code: "105",
                english: "[Ministry of Construction and Urban Development]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Барилга, хот байгуулалтын яам",
                        en: "Ministry of Construction and Urban Development"
                    }
                }
            },

            "Түлш, эрчим хүчний яам": {
                code: "106",
                english: "[Ministry of Fuel and Energy]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Түлш, эрчим хүчний яам",
                        en: "Ministry of Fuel and Energy"
                    }
                }
            },

            "Эрүүл мэндийн яам": {
                code: "107",
                english: "[Ministry of Health]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Эрүүл мэндийн яам",
                        en: "Ministry of Health"
                    }
                }
            },

            "Дэд бүтцийн яам": {
                code: "158",
                english: "[Ministry of Infrastructure]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Дэд бүтцийн яам",
                        en: "Ministry of Infrastructure"
                    }
                }
            },

            "Зам тээвэр, барилга, хот байгуулалтын яам": {
                code: "159",
                english: "[Ministry of Roads, Transportation, Construction and Urban Development]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Зам тээвэр, барилга, хот байгуулалтын яам",
                        en: "Ministry of Roads, Transportation, Construction and Urban Development"
                    }
                }
            },

            "Байгаль орчны яам": {
                code: "160",
                english: "[Ministry of Environment]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Байгаль орчны яам",
                        en: "Ministry of Environment"
                    }
                }
            },

            "Гадаад хэргийн яам": {
                code: "161",
                english: "[Ministry of Foreign Affairs]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Гадаад хэргийн яам",
                        en: "Ministry of Foreign Affairs"
                    }
                }
            },

            "Үйлдвэр, худалдааны яам": {
                code: "162",
                english: "[Ministry of Industry and Trade]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Үйлдвэр, худалдааны яам",
                        en: "Ministry of Industry and Trade"
                    }
                }
            },

            "Санхүү, эдийн засгийн яам": {
                code: "163",
                english: "[Ministry of Finance and Economic]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Санхүү, эдийн засгийн яам",
                        en: "Ministry of Finance and Economic"
                    }
                }
            },

            "Гэгээрлийн яам": {
                code: "164",
                english: "[Ministry of Enlightenment]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Гэгээрлийн яам",
                        en: "Ministry of Enlightenment"
                    }
                }
            }
        }
    },
    "Засгийн газрын агентлагийн даргын тушаал": {
        code: "35",
        english: "Ordinances of administrative agency chiefs",
        itemType: "regulation",
        boilerplate: {},
        children: {
            "Биеийн тамир, спортын хороо": {
                code: "137",
                english: "[Physical Culture and Sports Committee]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Биеийн тамир, спортын хороо",
                        en: "Physical Culture and Sports Committee"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Мэдээлэл, харилцаа холбоо, технологийн газар": {
                code: "108",
                english: "[Information, Comunication and Technology Authority]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Мэдээлэл, харилцаа холбоо, технологийн газар",
                        en: "Information, Comunication and Technology Authority"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Тагнуулын ерөнхий газар": {
                code: "109",
                english: "[General Intelligence Agency]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Тагнуулын ерөнхий газар",
                        en: "General Intelligence Agency"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Төрийн өмчийн хороо": {
                code: "110",
                english: "[State Property Committee]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Төрийн өмчийн хороо",
                        en: "State Property Committee"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Стандартчилал, хэмжил зүйн төв": {
                code: "111",
                english: "[Standardization and Metrology Agency]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Стандартчилал, хэмжил зүйн төв",
                        en: "Standardization and Metrology Agency"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Шударга бус өрсөлдөөнийг хянан зохицуулах газар": {
                code: "112",
                english: "[Unfair Competition Regulatory Authority]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Шударга бус өрсөлдөөнийг хянан зохицуулах газар",
                        en: "Unfair Competition Regulatory Authority"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Хил хамгаалах ерөнхий газар": {
                code: "113",
                english: "[General Authority for Border Protection]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Хил хамгаалах ерөнхий газар",
                        en: "General Authority for Border Protection"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Цагдаагийн ерөнхий газар": {
                code: "114",
                english: "[General Police Department]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Цагдаагийн ерөнхий газар",
                        en: "General Police Department"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Газрын харилцаа, геодези, зураг зүйн газар": {
                code: "115",
                english: "[Administration of Land Affairs, Construction, Geodesy and Cartography]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Газрын харилцаа, геодези, зураг зүйн газар",
                        en: "Administration of Land Affairs, Construction, Geodesy and Cartography"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Зэвсэгт хүчний жанжин штаб": {
                code: "116",
                english: "[General Staff of Armed Forces]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Зэвсэгт хүчний жанжин штаб",
                        en: "General Staff of Armed Forces"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Улсын мэргэжлийн хяналтын газар": {
                code: "117",
                english: "[General Agency for State Specialised Inspection]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Улсын мэргэжлийн хяналтын газар",
                        en: "General Agency for State Specialised Inspection"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Онцгой байдлын ерөнхий газар": {
                code: "118",
                english: "[National Emergency Management Agency]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Онцгой байдлын ерөнхий газар",
                        en: "National Emergency Management Agency"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Оюуны өмчийн газар": {
                code: "119",
                english: "[Intellectual Property Office]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Оюуны өмчийн газар",
                        en: "Intellectual Property Office"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Хүүхдийн төлөө үндэсний газар": {
                code: "120",
                english: "[National Authority for Children]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Хүүхдийн төлөө үндэсний газар",
                        en: "National Authority for Children"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Удирдлагын академи": {
                code: "121",
                english: "[Academy of Management]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Удирдлагын академи",
                        en: "Academy of management"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Төр, засгийн үйлчилгээ, аж ахуйг эрхлэх газар": {
                code: "122",
                english: "[State and Government Service Agency]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Төр, засгийн үйлчилгээ, аж ахуйг эрхлэх газар",
                        en: "State and Government Service Agency"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Дипломат байгууллагын үйлчилгээ, аж ахуйн газар": {
                code: "123",
                english: "[Diplomatic Service Agency]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Дипломат байгууллагын үйлчилгээ, аж ахуйн газар",
                        en: "Diplomatic Service Agency"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Улсын гаалийн ерөнхий газар": {
                code: "124",
                english: "[General Customs Office]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Улсын гаалийн ерөнхий газар",
                        en: "General Customs Office"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Үндэсний татварын ерөнхий газар": {
                code: "125",
                english: "[General Department of Taxation]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Үндэсний татварын ерөнхий газар",
                        en: "General Department of Taxation"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Иргэний бүртгэл мэдээллийн улсын төв": {
                code: "126",
                english: "[General Authority for State Registration and Information]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Иргэний бүртгэл мэдээллийн улсын төв",
                        en: "General Authority for State Registration and Information"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Үндэсний архивын газар": {
                code: "127",
                english: "[General Archival Authority]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Үндэсний архивын газар",
                        en: "General Archival Authority"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Шүүхийн шийдвэр гүйцэтгэх ерөнхий газар": {
                code: "128",
                english: "[General Executive Department of Court Decisions]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Шүүхийн шийдвэр гүйцэтгэх ерөнхий газар",
                        en: "General Executive Department of Court Decisions"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Усны хэрэг эрхлэх газар": {
                code: "129",
                english: "[Water Authority]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Усны хэрэг эрхлэх газар",
                        en: "Water Authority"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Цаг уур, орчны шинжилгээний газар": {
                code: "130",
                english: "[National Agency for Metereology, Hydrology and Environment Monitoring]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Цаг уур, орчны шинжилгээний газар",
                        en: "National Agency for Metreology, Hydrology and Environment Monitoring"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Иргэний нисэхийн ерөнхий газар": {
                code: "131",
                english: "[Civil Aviation Authority]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Иргэний нисэхийн ерөнхий газар",
                        en: "Civil Aviation Authority"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Төмөр замын Хэрэг эрхлэх газар": {
                code: "132",
                english: "[Railway Authority]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Төмөр замын Хэрэг эрхлэх газар",
                        en: "Railway Authority"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Ашигт малтмал, газрын тосны Хэрэг эрхлэх газар": {
                code: "133",
                english: "[Mineral Resources and Petroleum Authority]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Ашигт малтмал, газрын тосны Хэрэг эрхлэх газар",
                        en: "Mineral Resources and Petroleum Authority"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Гадаадын хөрөнгө оруулалтын газар": {
                code: "134",
                english: "[Foreign Investment Authority]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Гадаадын хөрөнгө оруулалтын газар",
                        en: "Foreign Investment Authority"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Улсын нийгмийн даатгалын ерөнхий газар": {
                code: "135",
                english: "[Social Insurance General Office]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Улсын нийгмийн даатгалын ерөнхий газар",
                        en: "Social Insurance General Office"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Хөдөлмөр, халамжийн үйлчилгээний газар": {
                code: "136",
                english: "[Labour and Welfare Service Agency]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Хөдөлмөр, халамжийн үйлчилгээний газар",
                        en: "Labour and Welfare Service Agency"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            }
        }
    },
    "УИХ-аас томилогддог байгууллагын дарга, түүнтэй адилтгах албан тушаалтны шийдвэр": {
        code: "36",
        english: "Ordinances of chiefs of organizations established by the state Great Khural",
        itemType: "regulation",
        boilerplate: {},
        children: {
            "Монгол банк": {
                code: "87",
                english: "[Bank of Mongolia]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Монгол банк",
                        en: "Bank of Mongolia"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Төрийн албаны зөвлөл": {
                code: "88",
                english: "[Civil Service Counsil]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Төрийн албаны зөвлөл",
                        en: "Civil Service Council"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Сонгуулийн ерөнхий хороо": {
                code: "89",
                english: "[General Election Commission]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Сонгуулийн ерөнхий хороо",
                        en: "General Election Commission"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Авилгатай тэмцэх газар": {
                code: "90",
                english: "[Independent Authority Against Corruption]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Авилгатай тэмцэх газар",
                        en: "Independent Authority Against Corruption"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Үндэсний статистикийн газар": {
                code: "91",
                english: "[National Statistical Office]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Үндэсний статистикийн газар",
                        en: "National Statistical Office"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Хүний эрхийн үндэсний комисс": {
                code: "92",
                english: "[National Human Rights Commission]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Хүний эрхийн үндэсний комисс",
                        en: "National Human Rights Commission"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Үндэсний аудитын газар": {
                code: "93",
                english: "[Natinal Audit Office]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Үндэсний аудитын газар",
                        en: "National Audit Office"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            },

            "Санхүүгийн зохицуулах хороо": {
                code: "94",
                english: "[Financial Regulatory Commission]",
                boilerplate: {
                    regulatoryBody: {
                        mn: "Санхүүгийн зохицуулах хороо",
                        en: "Financial Regulatory Commission"
                    },
                    regulationType: {
                        mn: "Тушаал",
                        en: "Ordinance"
                    }
                }
            }
        }
    },
    "Аймаг, нийслэлийн ИТХ-ын шийдвэр": {
        code: "37",
        english: "Decisions of aimag and capital city representative khurals",
        itemType: "statute",
        boilerplate: {},
        children: {
            "Архангай аймаг": {
                code: "65",
                english: "Arkhangai",
                boilerplate: {
                    jurisdiction: "mn;arkhangai"
                }
            },

            "Баян-Өлгий аймаг": {
                code: "66",
                english: "Bayan-Uglii",
                boilerplate: {
                    jurisdiction: "mn;bayan-ulgii"
                }
            },

            "Баянхонгор аймаг": {
                code: "67",
                english: "Bayankhongor",
                boilerplate: {
                    jurisdiction: "mn;bayankhongor"
                }
            },

            "Булган аймаг": {
                code: "68",
                english: "Bulgan",
                boilerplate: {
                    jurisdiction: "mn;bulgan"
                }
            },

            "Говь-Алтай аймаг": {
                code: "69",
                english: "Govi-Altai",
                boilerplate: {
                    jurisdiction: "mn;govi-altai"
                }
            },

            "Говьсүмбэр аймаг": {
                code: "70",
                english: "Govisumber",
                boilerplate: {
                    jurisdiction: "mn;govisumber"
                }
            },

            "Дархан-Уул аймаг": {
                code: "71",
                english: "Darkhan-Uul",
                boilerplate: {
                    jurisdiction: "mn;darkhan-uul"
                }
            },

            "Дорноговь аймаг": {
                code: "72",
                english: "Dornogovi",
                boilerplate: {
                    jurisdiction: "mn;dornogovi"
                }
            },

            "Дорнод аймаг": {
                code: "73",
                english: "Dornod",
                boilerplate: {
                    jurisdiction: "mn;dornod"
                }
            },

            "Дундговь аймаг": {
                code: "74",
                english: "Dundgovi",
                boilerplate: {
                    jurisdiction: "mn;dundgovi"
                }
            },

            "Завхан аймаг": {
                code: "75",
                english: "Zavkhan",
                boilerplate: {
                    jurisdiction: "mn;zavkhan"
                }
            },

            "Орхон аймаг": {
                code: "76",
                english: "Orkhon",
                boilerplate: {
                    jurisdiction: "mn;orkhon"
                }
            },

            "Сэлэнгэ аймаг": {
                code: "77",
                english: "Selenge",
                boilerplate: {
                    jurisdiction: "mn;selenge"
                }
            },

            "Сүхбаатар аймаг": {
                code: "78",
                english: "Sukhbaatar",
                boilerplate: {
                    jurisdiction: "mn;sukhbaatar"
                }
            },

            "Төв аймаг": {
                code: "79",
                english: "Tuv",
                boilerplate: {
                    jurisdiction: "mn;tuv"
                }
            },

            "Увс аймаг": {
                code: "80",
                english: "Uvs",
                boilerplate: {
                    jurisdiction: "mn;uvs"
                }
            },

            "Улаанбаатар": {
                code: "81",
                english: "Ulaanbaatar",
                boilerplate: {
                    jurisdiction: "mn;ulaanbaatar"
                }
            },

            "Ховд аймаг": {
                code: "82",
                english: "Khovd",
                boilerplate: {
                    jurisdiction: "mn;khovd"
                }
            },

            "Хэнтий аймаг": {
                code: "83",
                english: "Khentii",
                boilerplate: {
                    jurisdiction: "mn;khentii"
                }
            },

            "Хөвсгөл аймаг": {
                code: "84",
                english: "Khuvsgul",
                boilerplate: {
                    jurisdiction: "mn;khuvsgul"
                }
            },

            "Өвөрхангай аймаг": {
                code: "85",
                english: "Uvurkhangai",
                boilerplate: {
                    jurisdiction: "mn;uvurkhangai"
                }
            },

            "Өмнөговь аймаг": {
                code: "86",
                english: "Umnugovi",
                boilerplate: {
                    jurisdiction: "mn;umnugovi"
                }
            }
        }
    },
    "Аймаг, нийслэлийн Засаг даргын захирамж": {
        code: "38",
        english: "Ordinances of aimag and capital city governors",
        itemType: "regulation",
        boilerplate: {},
        children: {
            "Архангай аймаг": {
                code: "39",
                english: "Arkhangai",
                boilerplate: {
                    jurisdiction: "mn;arkhangai"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Баян-Өлгий аймаг": {
                code: "40",
                english: "Bayan-Uglii",
                boilerplate: {
                    jurisdiction: "mn;bayan-ulgii"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Баянхонгор аймаг": {
                code: "41",
                english: "Bayankhongor",
                boilerplate: {
                    jurisdiction: "mn;bayankhongor"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Булган аймаг": {
                code: "46",
                english: "Bulgan",
                boilerplate: {
                    jurisdiction: "mn;bulgan"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Говь-Алтай аймаг": {
                code: "47",
                english: "Govi-Altai",
                boilerplate: {
                    jurisdiction: "mn;govi-altai"
                },
                regulationType: {
                    mn: "Захирмж",
                    en: "Ordinance"
                }
            },

            "Говьсүмбэр аймаг": {
                code: "48",
                english: "Govisumber",
                boilerplate: {
                    jurisdiction: "mn;govisumber"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Дархан-Уул аймаг": {
                code: "49",
                english: "Darkhan-Uul",
                boilerplate: {
                    jurisdiction: "mn;darkhan-uul"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Дорноговь аймаг": {
                code: "50",
                english: "Dornogovi",
                boilerplate: {
                    jurisdiction: "mn;dornogovi"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Дорнод аймаг": {
                code: "51",
                english: "Dornod",
                boilerplate: {
                    jurisdiction: "mn;dornod"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Дундговь аймаг": {
                code: "52",
                english: "Dundgovi",
                boilerplate: {
                    jurisdiction: "mn;dundgovi"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Завхан аймаг": {
                code: "53",
                english: "Zavkhan",
                boilerplate: {
                    jurisdiction: "mn;zavkhan"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Орхон аймаг": {
                code: "54",
                english: "Orkhon",
                boilerplate: {
                    jurisdiction: "mn;orkhon"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Сэлэнгэ аймаг": {
                code: "55",
                english: "Selenge",
                boilerplate: {
                    jurisdiction: "mn;selenge"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Сүхбаатар аймаг": {
                code: "56",
                english: "Sukhbaatar",
                boilerplate: {
                    jurisdiction: "mn;sukhbaatar"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Төв аймаг": {
                code: "57",
                english: "Tuv",
                boilerplate: {
                    jurisdiction: "mn;tuv"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Увс аймаг": {
                code: "58",
                english: "Uvs",
                boilerplate: {
                    jurisdiction: "mn;uvs"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Улаанбаатар": {
                code: "59",
                english: "Ulaanbaatar",
                boilerplate: {
                    jurisdiction: "mn;ulaanbaatar"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Ховд аймаг": {
                code: "60",
                english: "Khovd",
                boilerplate: {
                    jurisdiction: "mn;khovd"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Хэнтий аймаг": {
                code: "61",
                english: "Khentii",
                boilerplate: {
                    jurisdiction: "mn;khentii"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Хөвсгөл аймаг": {
                code: "62",
                english: "Khuvsgul",
                boilerplate: {
                    jurisdiction: "mn;khuvsgul"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Өвөрхангай аймаг": {
                code: "63",
                english: "Uvurkhangai",
                boilerplate: {
                    jurisdiction: "mn;uvurkhangai"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            },

            "Өмнөговь аймаг": {
                code: "64",
                english: "Umnugovi",
                boilerplate: {
                    jurisdiction: "mn;umnugovi"
                },
                regulationType: {
                    mn: "Захирамж",
                    en: "Ordinance"
                }
            }
        }
    }
}
    
var fieldmap = {
    "case": {
        title: "abstractNote",
        number: "docketNumber",
        enactedDate: "dateDecided"
    },
    bill: {
        title: "title",
        number: "billNumber",
        enactedDate: "date"
    },
    regulation: {
        title: "nameOfAct",
        number: "publicLawNumber",
        enactedDate: "dateEnacted",
        effectiveDate: "extra"
    },
    statute: {
        title: "nameOfAct",
        number: "publicLawNumber",
        enactedDate: "dateEnacted",
        effectiveDate: "extra"
    },
    treaty: {
        title: "title",
        enactedDate: "signingDate",
        effectiveDate: "date"
    }
}

/*
 ******************
 * Global functions
 ******************
 */

function getInfoFromDocument (doc) {
    var category;
    var subcategory;
    var crumbs = ZU.xpath(doc,'//h2[@class="crumbs"]/a');
    var ret;
    if (crumbs.length > 1) {
        ret = {};
        category = crumbs.slice(1,2)[0].textContent.replace(/^\s*(.*?)\s*$/, "$1");
        ret.cat = category;
        ret.title = crumbs.slice(-1)[0].textContent;
    }
    if (crumbs.length === 4) {
        subcategory = crumbs.slice(2,3)[0].textContent.replace(/^\s*(.*?)\s*$/, "$1");
        ret.subcat = subcategory;
    }
    if (ret.cat === "Үндсэн хуулийн цэцийн шийдвэр") {
        // Subcategory of rulings of the Constitutional Tsets need to be extracted from the
        // document body; the header for these isn't informative.
        ret.subcat = false;
        var nodes = doc.getElementsByTagName("center");
        for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
            var txt = nodes[i].textContent;
            // Try for a label in slashes first
            var m = txt.match(/(.*?)\/(дүгнэлт|тогтоол)\/.*/i);
            if (m) {
                ret.abstractNote = convertToTextCase(m[1].replace(/^\s*(.*?)\s*$/,"$1"));
                if (m[2].toLowerCase() === "тогтоол") {
                    ret.subcat = "Тогтоол";
                } else {
                    ret.subcat = "Дүгнэлт";
                }
            }
        }
        if (!ret.subcat) {
            for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
                var txt = nodes[i].textContent;
                // Try for the bare word if we didn't find anything
                var m = txt.match(/.*(дүгнэлт|тогтоол).*/i);
                if (m) {
                    if (m[1].toLowerCase() === "тогтоол") {
                        ret.subcat = "Тогтоол";
                    } else {
                        ret.subcat = "Дүгнэлт";
                    }
                }
            }
        }
    }
    return ret;
}

function getFullURL (doc,url) {
    if (url.slice(0,1) === "/") {
        var base = doc.location.href;
        base = base.replace(/^(https?:\/\/[^\/]*).*/,"$1")
        url = base + url;
    }
    return url;
}

function convertToTextCase(t) {
    var lst = t.split(/\s+/);
    for (var j=0,jlen=lst.length;j<jlen;j+=1) {
        lst[j] = lst[j].slice(0,1).toUpperCase() + lst[j].slice(1).toLowerCase();
    }
    t = lst.join(" ");
    return t;
}

/*
  *******************
  * Dynamic functions
  *******************
  */

function Engine () {}

Engine.prototype.getInfoFromList = function(doc) {
    var typenode = ZU.xpath(doc,'//select[@id="fcategory"]/option[@selected="selected"][1]')[0];
    var rownode = ZU.xpath(doc, '//div[@id="datagrid"]//div[@class="tbd"]/div[contains(@class,"row")][1]')[0];
    if (rownode && typenode) {
        this.info = {}
        this.info.cat = typenode.textContent.replace(/^\s*(.*?)\s*$/,"$1");
        this.info.itemType = inputmap[this.info.cat].itemType;
    } else {
        this.info = false;
    }
    return this.info;
}

Engine.prototype.getItemData = function (doc) {
    var items = {};
    var supp = {};
    var ensupp = {};

    var rows = ZU.xpath(doc, '//div[@id="page-container"]//div[@id="datagrid"]//div[contains(@class,"tbd")]/div[contains(@class,"row")]');

    for (i=0,ilen=rows.length;i<ilen;i+=1) {

        var cells = rows[i].childNodes;
        // The width of the list varies, with drop-outs on both sides of
        // title. So we sniff the position of title, and then infer the
        // position of other cells from there.
        pos = {
            title: 0,
            number: 0,
            enactedDate: 0,
            effectiveDate: 0
        }
        for (var j=0,jlen=cells.length;j<jlen;j+=1) {
            if (cells[j].getElementsByTagName("a").length) {
                pos.title = j;
                break;
            }
        }
        if (pos.title) {
            if (pos.title === 1) {
                pos.enactedDate = 2;
                pos.effectiveDate = 3;
            } else if (pos.title === 2) {
                pos.number = 1;
                pos.enactedDate = 3;
                pos.effectiveDate = 4;
            }

            var u = cells[pos.title].childNodes[0].getAttribute("href");
            u = getFullURL(doc,u);

            var t = cells[pos.title].childNodes[0].textContent;
            items[u] = t;
            if (t) {
                t = t.replace(/^\s*[0-9]+\.\s*/,"")
                t = convertToTextCase(t);
            }

            supp[u] = { itemType: this.info.itemType, cat: this.info.cat, subcat: this.info.subcat, title: t };
            ensupp[u] = {};
            
            if (cells[pos.enactedDate].textContent.replace(/^\s*(.*?)\s*$/, "$1")) {
                supp[u].enactedDate = cells[pos.enactedDate].textContent;
            }

            if (cells[pos.effectiveDate].textContent.replace(/^\s*(.*?)\s*$/, "$1")) {
                supp[u].effectiveDate = cells[pos.effectiveDate].textContent;
            }

            if (pos.number && cells[pos.number].textContent.replace(/^\s*(.*?)\s*$/, "$1")) {
                supp[u].number = cells[pos.number].textContent;
            }
        }
    }
    return { items: items, supp: supp, ensupp: ensupp };
}

Engine.prototype.selectedItemsCallback = function (urls, supp, ensupp) {
    ZU.processDocuments(urls, function (doc) {
		var url = doc.documentURI;
        var type = supp[url].itemType;
        var item = new Zotero.Item(type);
        item.url = url;
        item.jurisdiction = "mn";

        // Pick up subcat boilerplate fields, which can only be determined with
        // confidence after we have the document
        var info = getInfoFromDocument(doc);
        for (var fieldname in inputmap[info.cat].boilerplate) {
            if ("string" === typeof inputmap[info.cat].boilerplate[fieldname]) {
                item[fieldname] = inputmap[info.cat].boilerplate[fieldname];
            } else {
                item[fieldname] = inputmap[info.cat].boilerplate[fieldname].mn;
                ZU.setMultiField(item, fieldname, inputmap[info.cat].boilerplate[fieldname].en, "en");
            }
        }
        if (info.subcat) {
            for (var fieldname in inputmap[info.cat].children[info.subcat].boilerplate) {
                if ("string" === typeof inputmap[info.cat].children[info.subcat].boilerplate[fieldname]) {
                    item[fieldname] = inputmap[info.cat].children[info.subcat].boilerplate[fieldname];
                } else {
                    item[fieldname] = inputmap[info.cat].children[info.subcat].boilerplate[fieldname].mn;
                    ZU.setMultiField(item, fieldname, inputmap[info.cat].children[info.subcat].boilerplate[fieldname].en, "en");
                }
                if (inputmap[info.cat].children[info.subcat].changes) {
                    var docdate = new Date(supp[url].enactedDate.replace("-","/","g"));
                    for (var changedatestr in inputmap[info.cat].children[info.subcat].changes) {
                        var changedate = new Date(changedatestr.replace("-","/","g"));
                        if (docdate >= changedate) {
                            for (var fieldname in inputmap[info.cat].children[info.subcat].changes[changedatestr].boilerplate) {
                                item[fieldname] = inputmap[info.cat].children[info.subcat].changes[changedatestr].boilerplate[fieldname].mn;
                                ZU.setMultiField(item, fieldname, inputmap[info.cat].children[info.subcat].changes[changedatestr].boilerplate[fieldname].en, "en");
                            }
                            docdate = changedate;
                        }
                    }
                }
            }
        }

        // for (var key in fieldmap[type]) {
        for (var key in supp[url]) {
            item[fieldmap[type][key]] = supp[url][key];
        }
        // Fix truncated titles on decisions of the Constitutional Tsets
        if (info.abstractNote) {
            item.abstractNote = info.abstractNote;
        }
        // Extract page content for save here.
        var content = doc.getElementsByClassName("content_field");
        if (content && content.length) {
            content = content[0];
            // Delete word processor and download icons, they're not part of content
            var anchors = content.getElementsByTagName("a");
            for (var i=anchors.length-1;i>-1;i+=-1) {
                var href = anchors[i].getAttribute("href");
                if (href && href.match(/(?:showPrint|downloadDoc)/)) {
                    anchors[i].parentNode.removeChild(anchors[i]);
                }
            }
            var title = supp[url].title;
            var myns = "http://www.w3.org/1999/xhtml"
            var head = doc.createElementNS(myns, "head");
            var titlenode = doc.createElementNS(myns, "title");
            head.appendChild(titlenode)
            titlenode.appendChild(doc.createTextNode(title));
            var style = doc.createElementNS(myns, "style");
            head.appendChild(style)
            style.setAttribute("type", "text/css")
            
            var css = "*{margin:0;padding:0;}table, div{width: 60em;margin:0 auto;text-align:left;margin-top:1em;margin-bottom:1em;}body{text-align:center;}div.mlz-link-button a{text-decoration:none;background:#cccccc;color:white;border-radius:1em;font-family:sans;padding:0.2em 0.8em 0.2em 0.8em;}div.mlz-link-button a:hover{background:#bbbbbb;}div.mlz-link-button{margin: 0.7em 0 0.8em 0;}";
            
            style.appendChild(doc.createTextNode(css));
            var newDoc = ZU.composeDoc(doc, head, content);
            
            item.attachments.push({ url:item.url, mimeType: "text/html", document: newDoc, snapshot: true })
        }
        item.complete();
    }, function(){Zotero.done();});
}

function detectWeb(doc,url) {
    var engine = new Engine(doc);
    if (engine.getInfoFromList(doc)) {
        return "multiple";
    }
}
    
function doWeb(doc, url) {
    var engine = new Engine();
    engine.getInfoFromList(doc);
    if (engine.info) {
        //   * The category (preset from index page)
        //   * The subcategory (optional, from index page)
        //   * The type (derived from index page)
        var data = engine.getItemData(doc);
        var items = [];
        var selectedItemsCallback = engine.selectedItemsCallback;
        Zotero.selectItems(data.items, function (chosen) {
	        for (var j in chosen) {
		        items.push(j);
	        }
	        selectedItemsCallback(items, data.supp, data.ensupp);
        });
    }
}
