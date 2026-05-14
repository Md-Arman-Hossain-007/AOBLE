export const FULL_EXAMPLE_RESPONSE = {
  "screening_id": "3653c227-aa58-4d09-9ccd-3f07484d874a",
  "overall_status": "alert",
  "risk_level": "HIGH",
  "match_count": 5,
  "screened_at": "2026-05-14T12:27:19.864392",
  "query": {
    "name": "kim jong_un",
    "type": "individual",
    "details": {
      "name": "kim jong_un",
      "birth_date": "",
      "nationality": ""
    }
  },
  "matches": [
    {
      "match_id": "M-1",
      "entity_id": "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7",
      "schema_type": "Person",
      "caption": "Kim Jong Un",
      "aliases": [
        "Kim Jong Un"
      ],
      "score": 0.95,
      "risk_level": "HIGH",
      "topic_risk": 0.8,
      "primary_topic": "sanction.linked",
      "match_features": {
        "name_match": 1.0
      },
      "topics": [
        "sanction.linked"
      ],
      "datasets": [
        "core_watchlist"
      ],
      "sources": [
        {
          "identifier": "core_watchlist",
          "title": "core_watchlist",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [],
      "nationalities": [
        "kp"
      ],
      "countries": [
        "kp"
      ],
      "id_numbers": [],
      "positions": [],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/kprusi-c028d105d9b484941c81e05a99b396deed11d5c7/",
      "status": "potential",
      "deep_dive": {
        "id": "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7",
        "caption": "Kim Jong Un",
        "schema": "Person",
        "properties": {
          "topics": [
            "sanction.linked"
          ],
          "alias": [
            "Kim Jung Un",
            "김정은"
          ],
          "gender": [
            "male"
          ],
          "sourceUrl": [
            "https://www.nknews.org/pro/nk-leadership-tracker/elitesbio/kim-jong-un"
          ],
          "notes": [
            "On p. 133 of the UN Panel of Experts September 2022 report, Kim Jong Un is misspelled as Kim Jun Un. In the September 2023 report, he is misspelled as Kim Jon Un (p. 100; 101)."
          ],
          "name": [
            "Kim Jong Un"
          ],
          "nationality": [
            "kp"
          ],
          "country": [
            "kp"
          ],
          "description": [
            "Highest-ranking official of the Democratic People's Republic of Korea. General Secretary of the Workers' Party of Korea."
          ],
          "membershipMember": [
            {
              "id": "kprusi-83c4cff16ef8c13cf820f62c4f04890ac1af3a63",
              "caption": "Chairman/President",
              "schema": "Membership",
              "properties": {
                "role": [
                  "Chairman/President"
                ],
                "organization": [
                  {
                    "id": "NK-7jUPffhfwisLr8sQZ3XNpQ",
                    "caption": "State Affairs Commission",
                    "schema": "Organization",
                    "properties": {
                      "topics": [
                        "export.control",
                        "sanction"
                      ],
                      "country": [
                        "kp"
                      ],
                      "address": [
                        "Korea, North"
                      ],
                      "name": [
                        "State Affairs Commission"
                      ],
                      "programId": [
                        "US-NK"
                      ],
                      "sourceUrl": [
                        "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=22283"
                      ]
                    },
                    "datasets": [
                      "sanctions"
                    ],
                    "referents": [
                      "usgsa-db205c4edfc794bec0bd8fa282d7a3e5a6c56b1a",
                      "usgsa-s4mr6pl0c",
                      "ofac-22283",
                      "tw-shtc-a2ca6c964e605cf828de9b25d178ed02f863d7ed",
                      "kprusi-06572e18ee310f4603c10c3b92c7aae5d9cc30f3"
                    ],
                    "target": true,
                    "first_seen": "2023-04-20T10:27:20",
                    "last_seen": "2026-05-13T06:53:02",
                    "last_change": "2026-01-06T08:10:01"
                  }
                ],
                "member": [
                  "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7"
                ],
                "startDate": [
                  "2016-06"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-11-29T17:29:01",
              "last_seen": "2026-03-18T17:29:02",
              "last_change": "2023-11-29T17:29:01"
            },
            {
              "id": "kprusi-9bbe4dd70cc94c7fcf0580f9ba873cf5547386e2",
              "caption": "Marshall of the Republic",
              "schema": "Membership",
              "properties": {
                "organization": [
                  {
                    "id": "NK-iG8mEHYEpoB8yLPYZb9rRH",
                    "caption": "Korean People's Army",
                    "schema": "Organization",
                    "properties": {
                      "name": [
                        "Koreai Néphadsereg",
                        "Koreas Folkehær",
                        "Armata Populară Coreeană",
                        "Ejército Popular de Corea",
                        "Λαϊκός Στρατός της Κορέας",
                        "Korėjos liaudies armija",
                        "ARMEE POPULAIRE COREENNE",
                        "Korejska ljudska vojska",
                        "Korejas Tautas armija",
                        "Exército do Povo Coreano",
                        "조선인민군",
                        "Korea rahvaarmee",
                        "Korean kansanarmeija",
                        "Kórejská ľudová armáda",
                        "Narodna armija Koreje",
                        "Korean People's Army",
                        "Ludowe Siły Zbrojne Korei",
                        "Koreanska folkarmén",
                        "Koreanische Volksarmee",
                        "Armée populaire coréenne",
                        "Armata tal-Poplu Korean",
                        "Корейска народна армия",
                        "Esercito popolare coreano",
                        "Koreaans Volksleger",
                        "Korejská lidová armáda"
                      ],
                      "notes": [
                        "L’armée populaire coréenne comprend les forces stratégiques (anciennement forces balistiques stratégiques), qui contrôlent les unités de missiles stratégiques nucléaires et conventionnels de la RPDC. Les forces balistiques stratégiques ont été inscrites sur la liste établie dans le cadre de la résolution 2356 (2017) du Conseil de sécurité des Nations unies",
                        "(Date of UN designation: 2017-10-16)",
                        "The Director Disqualification Sanction was imposed on 09/04/2025.",
                        "The Korean People’s Army includes the Strategic Force (previously Strategic Rocket Force), which controls the DPRK’s nuclear and conventional strategic missile units. The Strategic Rocket Force has been listed by the United Nations Security Council Resolution 2356 (2017)."
                      ],
                      "topics": [
                        "export.control",
                        "sanction"
                      ],
                      "sourceUrl": [
                        "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=22284",
                        "https://gels-avoirs.dgtresor.gouv.fr/Gels/RegistreDetail?idRegistre=2251",
                        "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202403152"
                      ],
                      "alias": [
                        "Koreai Néphadsereg",
                        "Koreas Folkehær",
                        "Armata Populară Coreeană",
                        "Ejército Popular de Corea",
                        "Korėjos liaudies armija",
                        "Λαϊκός Στρατός της Κορέας",
                        "Korejska ljudska vojska",
                        "Korejas Tautas armija",
                        "Exército do Povo Coreano",
                        "조선인민군",
                        "Korea rahvaarmee",
                        "Korean kansanarmeija",
                        "Kórejská ľudová armáda",
                        "Narodna armija Koreje",
                        "Ludowe Siły Zbrojne Korei",
                        "Koreanska folkarmén",
                        "Koreanische Volksarmee",
                        "Armée populaire coréenne",
                        "Armata tal-Poplu Korean",
                        "Корейска народна армия",
                        "Esercito popolare coreano",
                        "Koreaans Volksleger",
                        "Korejská lidová armáda"
                      ],
                      "programId": [
                        "US-NK",
                        "EU-PRK",
                        "GB-DPRK",
                        "UN-SC1718"
                      ],
                      "modifiedAt": [
                        "2024-12-16"
                      ],
                      "country": [
                        "kp"
                      ],
                      "address": [
                        "Korea, North"
                      ]
                    },
                    "datasets": [
                      "sanctions"
                    ],
                    "referents": [
                      "usgsa-c35007ce3d5de38ddac0fac2ff18756b02dabf2e",
                      "gb-fcdo-dpr0061",
                      "gb-hmt-13548",
                      "gb-coh-vf3w3drimypnmrywqhcwza3qsoq",
                      "kprusi-5236c941e08453c2f1a5e4966917625a39002415",
                      "usgsa-s4mr6pl0d",
                      "mc-freezes-08f2202b0f97ab2a43612aa572b106cbe8332850",
                      "be-fod-bc1fe01cf6b5fb206541c983bbbaa95d21829b19",
                      "fr-ga-2251",
                      "ofac-22284",
                      "tw-shtc-83bfb02477c33c2631b2625bda56fe625d73ee2c",
                      "eu-fsf-eu-4094-64",
                      "eu-oj-6390cdfd8a2d076bf2d0a8a31e37d83f530d3a74"
                    ],
                    "target": true,
                    "first_seen": "2023-04-20T10:12:18",
                    "last_seen": "2026-05-13T06:58:02",
                    "last_change": "2026-04-24T10:57:01"
                  }
                ],
                "role": [
                  "Supreme Commander",
                  "Marshall of the Republic"
                ],
                "member": [
                  "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-08-08T13:49:31",
              "last_seen": "2026-03-18T17:29:02",
              "last_change": "2023-08-08T13:49:31"
            },
            {
              "id": "kprusi-469eaa4eca54f4730fd0b1eae5e32c0ac45d602c",
              "caption": "Former First Chairman",
              "schema": "Membership",
              "properties": {
                "member": [
                  "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7"
                ],
                "organization": [
                  {
                    "id": "NK-ZPdzueMb4QoCQgqoTuPYTR",
                    "caption": "National Defense Commission",
                    "schema": "Organization",
                    "properties": {
                      "address": [
                        "Pyongyang",
                        "Pyongyang Korea, North"
                      ],
                      "topics": [
                        "export.control",
                        "sanction"
                      ],
                      "country": [
                        "kp"
                      ],
                      "name": [
                        "National Defense Commission"
                      ],
                      "sourceUrl": [
                        "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=19490"
                      ],
                      "programId": [
                        "US-NK"
                      ],
                      "addressEntity": [
                        "addr-9af7c55a80736cda588cf896f510b41b1add1636"
                      ]
                    },
                    "datasets": [
                      "sanctions"
                    ],
                    "referents": [
                      "tw-shtc-1e339560fcb4d5eccf4d2c519d86c856c3ef9656",
                      "kprusi-5e000813a3eaea4d29ff345d716c57385563986d",
                      "usgsa-8a9dcf8e7218488956956328879bb23c41cafce3",
                      "ofac-19490",
                      "usgsa-s4mr4zymr"
                    ],
                    "target": true,
                    "first_seen": "2023-04-20T10:27:20",
                    "last_seen": "2026-05-13T06:53:02",
                    "last_change": "2026-01-26T16:10:01"
                  }
                ],
                "role": [
                  "Former First Chairman"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-08-08T13:49:31",
              "last_seen": "2026-03-18T17:29:02",
              "last_change": "2023-11-29T17:29:01"
            },
            {
              "id": "kprusi-05a4edd6b87a6b250a3845bf6502d9e41cca3fbb",
              "caption": "Chairman",
              "schema": "Membership",
              "properties": {
                "organization": [
                  {
                    "id": "NK-EdmwaSZAmFvxbyfG7psqkz",
                    "caption": "CENTRAL MILITARY COMMISSION OF THE WORKERS’ PARTY OF KOREA",
                    "schema": "Organization",
                    "properties": {
                      "topics": [
                        "export.control",
                        "sanction.counter",
                        "sanction"
                      ],
                      "name": [
                        "Central Military Commission of the Workers' Party of Korea (CMC)",
                        "CENTRAL MILITARY COMMISSION OF THE WORKERS PARTY OF KOREA (CMC)",
                        "COMMISSION MILITAIRE CENTRALE DU PARTI DU TRAVAIL DE CORÉE",
                        "CENTRAL MILITARY COMMISSION OF THE WORKERS’ PARTY OF KOREA (CMC)",
                        "セントラル・ミリタリー・コミッション・オブ・ザ・ワーカーズ・パーティー・オブ・コリア",
                        "KORE İŞÇİ PARTİSİ MERKEZİ ASKERİ KOMİSYONU (CENTRAL MILITARY COMMISSIONOF THE WORKER'S PARTY OF KOREA/CMC)",
                        "Workers' Party of Korea Central Military Commission",
                        "CENTRAL MILITARY COMMISSION OF THE WORKERS’ PARTY OF KOREA",
                        "CENTRAL MILITARY COMMISSION OF THE WORKERS' PARTY OF KOREA"
                      ],
                      "createdAt": [
                        "2017-09-11"
                      ],
                      "notes": [
                        "KPe.051. The Central Military Commission is responsible for the development and implementation of the Workers’ Party of Korea’s military policies, commands and controls the DPRK’s military, and directs the country’s military defense industries in coordination with the State Affairs Commission.",
                        "(Date of UN designation: 2017-09-11)",
                        "The Central Military Commission is responsible for the development and implementation of the Workers’ Party of Korea’s military policies, commands and controls the DPRK’s military, and directs the country’s military defense industries in coordination with the State Affairs Commission.",
                        "Adresse : Pyongyang, RPDC",
                        "The Central Military Commission is responsible for the development and implementation of the Workers Party of Koreas military policies, commands and controls the DPRKs military, and directs the countrys military defense industries in coordination with the State Affairs Commission.",
                        "Other information: The Central Military Commission is responsible for the development and implementation of the Workers’ Party of Korea’s military policies, commands and controls the DPRK’s military, and directs the country’s military defense industries in coordination with the State Affairs Commission.",
                        "la Commission militaire centrale est chargée d'élaborer et de faire appliquer la politique militaire du Parti du travail de Corée. Elle commande et contrôle l'armée de la République populaire démocratique de Corée et dirige le secteur de la défense du pays en coordination avec la Commission des affaires publiques"
                      ],
                      "address": [
                        "北朝鮮平壌特別市",
                        "Pyongyang, North Korea",
                        "Pyongyang",
                        "Pyongyang Korea, North",
                        "Pyongyang Democratic Peoples Republic of Korea",
                        "Pyongyang, RPDC",
                        "Pyongyang, DPRK",
                        "Pyongyang, KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF",
                        "Pyongyang, DPR Korea",
                        "Pyongyang Democratic People's Republic of Korea",
                        "Pyongyang, Democratic People's Republic of Korea"
                      ],
                      "programId": [
                        "US-NK",
                        "SECO-NORTHKOREA",
                        "GB-DPRK",
                        "UN-SC1718",
                        "EU-PRK"
                      ],
                      "addressEntity": [
                        "addr-2e4b8764a08ea6dbbbcdb52e00dfaaab9919fccf",
                        "addr-6236b5051285bbb8bc8e81704a320368a2889485",
                        "NK-T3KCczpHiApwbKA6D8GXaW",
                        "addr-521b389d5a537c6b26024b5c9bfbb137a8d21538",
                        "addr-0a5e0a12bda04bdb883fb8a4f113536ebbf602df",
                        "addr-2fb38cfc5decffb1a0dc825dd7fc62caff26a00d"
                      ],
                      "sourceUrl": [
                        "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=19489",
                        "https://gels-avoirs.dgtresor.gouv.fr/Gels/RegistreDetail?idRegistre=2282",
                        "http://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32017R1568&from=EN"
                      ],
                      "country": [
                        "kp"
                      ],
                      "modifiedAt": [
                        "2025-04-15"
                      ],
                      "alias": [
                        "CMC",
                        "CENTRAL MILITARY COMMISSION OF THE WORKERS' PARTY OF KOREA",
                        "シー・エム・シー"
                      ],
                      "weakAlias": [
                        "CMC"
                      ],
                      "abbreviation": [
                        "CMC"
                      ]
                    },
                    "datasets": [
                      "sanctions"
                    ],
                    "referents": [
                      "gb-fcdo-dpr0127",
                      "mc-freezes-14795ceff3b1da5434341a62a5d2e252261e5810",
                      "fr-ga-2282",
                      "ja-mof-53bad2a49556fa38716d5267062541bcadcc4a76",
                      "gb-hmt-13541",
                      "usgsa-220b797282707e7aba8731e9b1a4db7cdd908ab3",
                      "il-wmd-c8100adb566d57c4cff976a9274a388368b12d7c",
                      "eu-fsf-eu-4007-47",
                      "usgsa-s4mr4zymq",
                      "kprusi-fa409debedb679de4de4b5bce4cd75ca65848448",
                      "md-terr-b3ec4cd94a1c5750659b432c1abfbc49a2548b63",
                      "ch-seco-37476",
                      "qa-nctc-6908627-central-military-commission-of-the-workers-party-of-korea-cmc",
                      "il-wmd-5d946e513c200284eff01dd333964b4b2f9dc873",
                      "ofac-19489",
                      "permid-5096755944",
                      "unsc-6908627",
                      "zafic-54-central-military-commission-of-the-workers-party-of-korea-cmc",
                      "ua-sfms-1526",
                      "tw-shtc-a85ddd2fe66a43cba0cef6d6289bd1e1800bd8d2",
                      "tr-fcib-6d4e1d093130affd2d2ee718e81dc73e5a82f1ca",
                      "tw-shtc-40e557abc3526b94780203cd59e8d21b26a5c1fe",
                      "be-fod-3bf08ce9f03b284b646178ac4720ab30314e21b9",
                      "au-dfat-3407-central-military-commission-of-the-workers-party-of-korea-cmc"
                    ],
                    "target": true,
                    "first_seen": "2022-04-27T18:12:14",
                    "last_seen": "2026-05-13T06:58:02",
                    "last_change": "2026-03-04T13:45:25"
                  }
                ],
                "member": [
                  "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7"
                ],
                "role": [
                  "Chairman"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-08-08T13:49:31",
              "last_seen": "2026-03-18T17:29:02",
              "last_change": "2023-08-08T13:49:31"
            },
            {
              "id": "kprusi-38df4aa2a46d788d4ae2243ce20a84fac232d0a6",
              "caption": "Member of the Presidium",
              "schema": "Membership",
              "properties": {
                "organization": [
                  {
                    "id": "kprusi-86c5e3cbfa2767fec951e00985be6dbb3dcf1b65",
                    "caption": "Politburo of the Central Committee of the Workers' Party of Korea",
                    "schema": "Organization",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "description": [
                        "Highest decision-making body of the Workers' Party of Korea, elected by the Central Committee."
                      ],
                      "alias": [
                        "Political Bureau"
                      ],
                      "country": [
                        "kp"
                      ],
                      "name": [
                        "Politburo of the Central Committee of the Workers' Party of Korea"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-08-08T13:49:31",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2024-06-18T18:40:02"
                  }
                ],
                "role": [
                  "Member of the Presidium"
                ],
                "member": [
                  "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-08-08T13:49:31",
              "last_seen": "2026-03-18T17:29:02",
              "last_change": "2023-08-08T13:49:31"
            },
            {
              "id": "kprusi-6187d1fee7f72c5b01942b313bf7b55843c45a28",
              "caption": "Full member",
              "schema": "Membership",
              "properties": {
                "member": [
                  "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7"
                ],
                "role": [
                  "Full member"
                ],
                "organization": [
                  {
                    "id": "kprusi-d3c8c6ccca31d7c4190b7c9f7bc9e358f9314951",
                    "caption": "Central Committee of the Korean Workers' Party",
                    "schema": "Organization",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "alias": [
                        "Central Committee of the Workers' Party of Korea",
                        "Central Committee"
                      ],
                      "description": [
                        "The Korean Workers' Party's chief executive body."
                      ],
                      "country": [
                        "kp"
                      ],
                      "name": [
                        "Central Committee of the Korean Workers' Party"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-08-08T13:49:31",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2024-06-18T18:40:02"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-08-08T13:49:31",
              "last_seen": "2026-03-18T17:29:02",
              "last_change": "2023-08-08T13:49:31"
            }
          ],
          "associates": [
            {
              "id": "kprusi-cd3f022c48c5f3794645e4de2c259bb34a51be24",
              "caption": "Associate",
              "schema": "Associate",
              "properties": {
                "relationship": [
                  "Kim Jong Il is the father of Kim Jong Un"
                ],
                "person": [
                  "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7"
                ],
                "associate": [
                  {
                    "id": "kprusi-2074d2139605083295b758d37cf301163262c979",
                    "caption": "Kim Jong Il",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "country": [
                        "kp"
                      ],
                      "description": [
                        "North Korean leader from 1994 to 2011."
                      ],
                      "name": [
                        "Kim Jong Il"
                      ],
                      "nationality": [
                        "kp"
                      ],
                      "gender": [
                        "male"
                      ],
                      "sourceUrl": [
                        "https://www.nknews.org/pro/nk-leadership-tracker/elitesbio/kim-jong-il"
                      ],
                      "alias": [
                        "김정일"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-08-08T13:49:31",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2024-07-03T18:40:03"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-08-08T13:49:31",
              "last_seen": "2026-03-18T17:29:02",
              "last_change": "2023-08-08T13:49:31"
            },
            {
              "id": "kprusi-9212e33904b67e5f0f34d0d47b480012427f73f4",
              "caption": "Associate",
              "schema": "Associate",
              "properties": {
                "associate": [
                  {
                    "id": "Q317824",
                    "caption": "Kim Jong-nam",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "role.pol",
                        "sanction.linked",
                        "role.rca"
                      ],
                      "nationality": [
                        "kp"
                      ],
                      "status": [
                        "Deceased"
                      ],
                      "name": [
                        "Kim Dzong Nam",
                        "کم جونگ نام",
                        "Kim Chŏng-nam",
                        "Kim Čong-nam",
                        "Kim Jong-nam",
                        "Kim Dzsongnam",
                        "Կիմ Ջոնգ Նամ",
                        "Кім Чон Нам",
                        "金正男",
                        "គីម ជុងណាំ",
                        "Ким Чон Нам",
                        "Kim Çen Nam",
                        "קים ג'ונג-נאם",
                        "김정남",
                        "Κιμ Τζονγκ-ναμ",
                        "کیم جونگ نام",
                        "Ким Чен Нам",
                        "كيم جونغ نام",
                        "Kim Jong Nam"
                      ],
                      "description": [
                        "Half-brother of Kim Jong Un. Assassinated by North Korean agents at the Kuala Lumpur airport in February 2017."
                      ],
                      "gender": [
                        "male"
                      ],
                      "birthDate": [
                        "1971-05-10"
                      ],
                      "notes": [
                        "This person was assassinated on February 13, 2017, at the Kuala Lumpur International Airport in Malaysia. For reference, see Paragraph 19 (p. 13) of the UN Panel of Experts September 2017 report.",
                        "Oldest son of North Korean leader Kim Jong-il (1971-2017)"
                      ],
                      "political": [
                        "Workers’ Party of Korea"
                      ],
                      "education": [
                        "Kim Il-sung University"
                      ],
                      "alias": [
                        "Chol Kim",
                        "Kim Yong Nam",
                        "Kim Jongnam",
                        "Kim Chol",
                        "Jong-nam Kim",
                        "Kim Sung-nam",
                        "Chŏng-nam Kim",
                        "Kim Nam Jong",
                        "Kim Jong Nam"
                      ],
                      "deathDate": [
                        "2017-02-13"
                      ],
                      "citizenship": [
                        "cn",
                        "kp"
                      ],
                      "weakAlias": [
                        "キム・ジョンナム",
                        "Pang Xiong",
                        "キムジョンナム"
                      ],
                      "wikidataId": [
                        "Q317824"
                      ],
                      "birthPlace": [
                        "Pyongyang"
                      ],
                      "wikipediaUrl": [
                        "https://enwiki.wikipedia.org/wiki/Kim_Jong-nam"
                      ],
                      "lastName": [
                        "Kim"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "kprusi-f2021554808fd7b49c30608f6cc20bcdda650a0f"
                    ],
                    "target": true,
                    "first_seen": "2023-07-18T22:03:41",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2026-03-19T01:00:15"
                  }
                ],
                "person": [
                  "kprusi-c028d105d9b484941c81e05a99b396deed11d5c7"
                ],
                "relationship": [
                  "Half-Brother"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-08-08T13:49:31",
              "last_seen": "2026-03-18T17:29:02",
              "last_change": "2023-08-08T13:49:31"
            }
          ]
        },
        "datasets": [
          "core_watchlist"
        ],
        "referents": [],
        "target": true,
        "first_seen": "2023-08-08T13:49:31",
        "last_seen": "2026-03-19T08:25:26",
        "last_change": "2024-06-18T18:40:02"
      }
    },
    {
      "match_id": "M-2",
      "entity_id": "Q56226",
      "schema_type": "Person",
      "caption": "Kim Jong-un",
      "aliases": [
        "Կիմ Ջոնգ Ուն",
        "किम जोङ उन",
        "Ким Чен Ун",
        "ကင်ဂျုံအွန်",
        "كيم جونغ أون",
        "Ким Џонг Ун",
        "Kim Čong-un",
        "KIM, Jong Un",
        "Kim Xhong-Un",
        "Kim Džongunas",
        "קים ג'ונג-און",
        "Kim Jong Un",
        "金正恩",
        "Кім Чэн Ын",
        "Кім Чен Ин",
        "Kim Dzsongun",
        "Jong Un Kim",
        "კიმ ჩენ ინი",
        "Kim Džong Un",
        "Kim Çen In",
        "کیم جونگ-اون",
        "Kims Čonins",
        "কিম জং উন",
        "Ким Чен Ир",
        "کم جونگ اون",
        "Kim Çžon Yn",
        "Kim Chŏng-un",
        "김정은",
        "Kim Dzong Un",
        "كيم چونج اون",
        "Ким Чен Ын",
        "Kim Jong-un",
        "Κιμ Γιονγκ-ουν",
        "किम जोंग उन",
        "គីម ចុងអ៊ឺន"
      ],
      "score": 0.95,
      "risk_level": "HIGH",
      "topic_risk": 1.0,
      "primary_topic": "sanction",
      "match_features": {
        "name_match": 1.0
      },
      "topics": [
        "export.control",
        "sanction",
        "role.pep",
        "role.pol",
        "role.rca",
        "debarment"
      ],
      "datasets": [
        "core_watchlist"
      ],
      "sources": [
        {
          "identifier": "core_watchlist",
          "title": "core_watchlist",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [
        "1982-01-08",
        "1984-01-08",
        "1983-01-08"
      ],
      "nationalities": [],
      "countries": [
        "kp"
      ],
      "id_numbers": [],
      "positions": [
        "General Secretary of the Workers' Party of Korea (2012-)",
        "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
        "Supreme People’s Assembly (member, 2014-)",
        "member of the Supreme People's Assembly",
        "President of the State Affairs Commission (2012-)",
        "Supreme Commander of the Korean People’s Army (2011-)",
        "Supreme Leader of North Korea (2011-)",
        "member of the Presidium of the Politburo of the Workers' Party of Korea",
        "Chairman of the Workers' Party of Korea",
        "President, State Affairs Commission (SAC)"
      ],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/Q56226/",
      "status": "potential",
      "deep_dive": {
        "id": "Q56226",
        "caption": "Kim Jong-un",
        "schema": "Person",
        "properties": {
          "classification": [
            "National government (current)"
          ],
          "alias": [
            "Kim Cong un",
            "کم جونگ اُن",
            "كم جونغ أون",
            "Կիմ Ջոնգ Ուն",
            "Ким Чен Ун",
            "Kim Džiuong Un",
            "Kîm Ngit-sṳ̀n",
            "Κιμ Τζονγκ-ουν",
            "ကင်ဂျုံအွန်",
            "Ким Чжон Ун",
            "Kim Jong Eun",
            "Kim Jong-Eun",
            "किम जोङ उन",
            "Kim Jung-Woon",
            "คิม จ็อง-อึน",
            "Kim Jung Woon",
            "Ким Џонг Ун",
            "Kim Čong-un",
            "קים דשאנג און",
            "Kim Xhong-Un",
            "Kim Džongunas",
            "Kim Yong Un",
            "קים ג'ונג-און",
            "Gĭng Céng-ŏng",
            "Gim Jeong-eun",
            "கிம் ஜொங்-உன்",
            "Kim Jong Un",
            "金正恩",
            "Кім Чэн Ын",
            "Ким Ден Ын",
            "Kim Jung-eun",
            "किम जोङ्ग उन",
            "Кім Чен Ин",
            "Kim Jong-Woon",
            "ኪም ጆንግ ኡን",
            "Kim Dzsongun",
            "Jong Un Kim",
            "Kim Jong-oen",
            "كيم جونغ اون",
            "Ким Чжон Ын",
            "کیم جونق-اون",
            "კიმ ჩენ ინი",
            "Kim Çen In",
            "کیم جونگ اون",
            "کیم جونگ-اون",
            "Κιμ Γιονγκ Ουν",
            "Kims Čonins",
            "Ким Чен Ир",
            "কিম জং উন",
            "کم جونگ اون",
            "Kim Chèng-un",
            "ಕಿಮ್ ಜೋಂಗ್ ಅನ್",
            "Kim Çžon Yn",
            "Kim Chŏng-un",
            "Kim Džong-un",
            "ਕਿਮ ਜੋਂਗ ਉਨ",
            "김정은",
            "Kim Dzong Un",
            "Kim Ĝong-un",
            "കിം ജോങ് യുൻ",
            "كيم چونج اون",
            "Ким Чен Ын",
            "ຄິມ ຈອງ-ອຶນ",
            "කිම් ජොං අං",
            "Mariscal Kim Jong-un",
            "Ким Джонъын",
            "किम जोंग-उन",
            "किम जोंग उन",
            "Kim Jong Woon",
            "کیم جۆنگ ئون"
          ],
          "position": [
            "General Secretary of the Workers' Party of Korea (2012-)",
            "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
            "Supreme People’s Assembly (member, 2014-)",
            "member of the Supreme People's Assembly",
            "President of the State Affairs Commission (2012-)",
            "Supreme Commander of the Korean People’s Army (2011-)",
            "Supreme Leader of North Korea (2011-)",
            "member of the Presidium of the Politburo of the Workers' Party of Korea",
            "Chairman of the Workers' Party of Korea",
            "President, State Affairs Commission (SAC)"
          ],
          "topics": [
            "export.control",
            "sanction",
            "role.pep",
            "role.pol",
            "role.rca",
            "debarment"
          ],
          "country": [
            "kp"
          ],
          "lastName": [
            "Kim"
          ],
          "birthDate": [
            "1982-01-08",
            "1984-01-08",
            "1983-01-08"
          ],
          "firstName": [
            "Jong Un",
            "Jung-eun"
          ],
          "wikidataId": [
            "Q56226"
          ],
          "citizenship": [
            "kp"
          ],
          "name": [
            "Կիմ Ջոնգ Ուն",
            "किम जोङ उन",
            "Ким Чен Ун",
            "ကင်ဂျုံအွန်",
            "كيم جونغ أون",
            "Ким Џонг Ун",
            "Kim Čong-un",
            "KIM, Jong Un",
            "Kim Xhong-Un",
            "Kim Džongunas",
            "קים ג'ונג-און",
            "Kim Jong Un",
            "金正恩",
            "Кім Чэн Ын",
            "Кім Чен Ин",
            "Kim Dzsongun",
            "Jong Un Kim",
            "კიმ ჩენ ინი",
            "Kim Džong Un",
            "Kim Çen In",
            "کیم جونگ-اون",
            "Kims Čonins",
            "কিম জং উন",
            "Ким Чен Ир",
            "کم جونگ اون",
            "Kim Çžon Yn",
            "Kim Chŏng-un",
            "김정은",
            "Kim Dzong Un",
            "كيم چونج اون",
            "Ким Чен Ын",
            "Kim Jong-un",
            "Κιμ Γιονγκ-ουν",
            "किम जोंग उन",
            "គីម ចុងអ៊ឺន"
          ],
          "address": [
            "Korea, North"
          ],
          "title": [
            "His Excellency"
          ],
          "sourceUrl": [
            "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=20157",
            "https://www.cia.gov/resources/world-leaders/foreign-governments/korea-north"
          ],
          "programId": [
            "US-NK"
          ],
          "uniqueEntityId": [
            "RVAXCBRK2CF4"
          ],
          "createdAt": [
            "2025-02-18"
          ],
          "political": [
            "Workers’ Party of Korea"
          ],
          "weakAlias": [
            "キム・ジョンウン",
            "김정운",
            "Pak Un",
            "KJU",
            "Josef Pwag"
          ],
          "education": [
            "Liebefeld-Steinhölzli State School",
            "Kim Il-sung Military University",
            "Kim Il-sung University"
          ],
          "ethnicity": [
            "Koreans"
          ],
          "gender": [
            "male"
          ],
          "birthPlace": [
            "Changsong County",
            "Wonsan",
            "Chagang Province",
            "Samjiyon"
          ],
          "notes": [
            "Supreme Leader of North Korea since 2011"
          ],
          "wikipediaUrl": [
            "https://enwiki.wikipedia.org/wiki/Kim_Jong_Un"
          ],
          "religion": [
            "atheism"
          ],
          "positionOccupancies": [
            {
              "id": "us-cia-0c8901dcb8401a819414e13a4e25b7c879f529cc",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "NK-Gff54J9WeGZvohynbfbcG5",
                    "caption": "President, State Affairs Commission (SAC)",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "country": [
                        "kp"
                      ],
                      "name": [
                        "President, State Affairs Commission (SAC)"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "us-cia-5ae3250e80b229d72631988c90c20d6e51503cfd",
                      "us-cia-1fa55f154296125d72f31f7105e64b577d91150a"
                    ],
                    "target": false,
                    "first_seen": "2023-08-16T06:02:46",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2025-03-28T14:19:13"
                  }
                ],
                "status": [
                  "current"
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-10-11T11:06:37",
              "last_seen": "2026-05-11T21:57:21",
              "last_change": "2024-10-11T11:06:37"
            },
            {
              "id": "NK-6fA5S6A6NSD9DVa7ZQ2HPa",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "Q21328639",
                    "caption": "member of the Supreme People's Assembly",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.legislative",
                        "gov.national"
                      ],
                      "name": [
                        "Member of the Supreme People’s Assembly",
                        "member of the Supreme People's Assembly",
                        "Member of the Supreme People's Assembly"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q21328639"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "wd-9a973f096c46b3d568863b457f35fb1df292d823",
                      "evpo-d0871dd4afc460ebc7553770dd3d430058bb656e"
                    ],
                    "target": false,
                    "first_seen": "2019-05-21T00:00:00",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-db282956c1eb662a56e8e684e59289231448a20c",
                "evpo-1ed262a4866f8ac9cb96ce244f6339544eaa0916",
                "wd-58743badf27a05f8e5b457507f80af852535e7be"
              ],
              "target": false,
              "first_seen": "2019-05-21T00:00:00",
              "last_seen": "2026-05-08T13:17:18",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "wd-6e3d3adba0792644a83df6b62f64792267e90905",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q707631",
                    "caption": "General Secretary of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "inceptionDate": [
                        "2016-05-09"
                      ],
                      "name": [
                        "General Secretary of the Workers' Party of Korea"
                      ],
                      "wikidataId": [
                        "Q707631"
                      ],
                      "country": [
                        "kp"
                      ],
                      "subnationalArea": [
                        "Workers’ Party of Korea"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-16T11:27:08",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-DUfTtjRJnTZT62EQSFB2ic",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q56876342",
                    "caption": "Supreme Leader of North Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "name": [
                        "Supreme Leader of North Korea"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q56876342"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "startDate": [
                  "2011-12-17"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-7b1806dfa742826ba192e78ef79254ecea7654ac",
                "wd-cb23683d9955b19ad286790689aee08685e204ca"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-YKWfKn7pwATkyvgTfdeVJp",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q4330651",
                    "caption": "Supreme Commander of the Korean People’s Army",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.national",
                        "gov.security"
                      ],
                      "name": [
                        "Supreme Commander of the Korean People’s Army"
                      ],
                      "inceptionDate": [
                        "1948"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q4330651"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-05-17T14:17:12",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "startDate": [
                  "2011-12-17"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-aa89e6af4b156edbb20bb4b122efcbbf8313a7cb",
                "wd-e7ce76ea2b0b3e133f943a0bbf24c38169d2b361"
              ],
              "target": false,
              "first_seen": "2025-06-14T14:45:34",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-YNKdDFGEm3bcK32SKEFJtn",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "sourceUrl": [
                  "https://nkinfo.unikorea.go.kr/nkp/theme/getPowerStructureDang.do"
                ],
                "post": [
                  {
                    "id": "Q98801004",
                    "caption": "member of the Presidium of the Politburo of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "wikidataId": [
                        "Q98801004"
                      ],
                      "name": [
                        "member of the Presidium of the Politburo of the Workers' Party of Korea"
                      ],
                      "country": [
                        "kp"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2025-05-17T12:48:05",
                    "last_seen": "2026-05-06T03:53:24",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-2835326d627ad9558fdcc2ae71078a63a8f22a90",
                "wd-3547f3c79b97fb27469a30dbc6a33975ee86d51f"
              ],
              "target": false,
              "first_seen": "2025-05-17T12:48:05",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-04-08T00:13:25"
            },
            {
              "id": "NK-jJDaRr3oF2C9qpZSR2KMky",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "startDate": [
                  "2012-04-11"
                ],
                "post": [
                  {
                    "id": "Q707631",
                    "caption": "General Secretary of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "inceptionDate": [
                        "2016-05-09"
                      ],
                      "name": [
                        "General Secretary of the Workers' Party of Korea"
                      ],
                      "wikidataId": [
                        "Q707631"
                      ],
                      "country": [
                        "kp"
                      ],
                      "subnationalArea": [
                        "Workers’ Party of Korea"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-13b05efde16546d867431dd6f02f5f69285ddd84",
                "wd-e9e93623a5dec3bc9cf7e46be5907e63b7602537"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "unprot-e296186a12331d553e50016bf0d745e66ee35511",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "unprot-97c2b5f685cac5d9c0e6f60e1ba059c1d0728a44",
                    "caption": "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
                    "schema": "Position",
                    "properties": {
                      "name": [
                        "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea"
                      ],
                      "topics": [
                        "gov.national"
                      ],
                      "country": [
                        "kp"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2026-02-15T14:12:06",
                    "last_seen": "2026-04-26T13:01:02",
                    "last_change": "2026-02-15T14:12:06"
                  }
                ],
                "status": [
                  "current"
                ],
                "startDate": [
                  "2012-03-08"
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-02-15T14:12:06",
              "last_seen": "2026-04-26T13:01:02",
              "last_change": "2026-02-15T14:12:06"
            },
            {
              "id": "wd-1964016e0b84bfc3f196a2977f35f15680a22f92",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "Q4330651",
                    "caption": "Supreme Commander of the Korean People’s Army",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.national",
                        "gov.security"
                      ],
                      "name": [
                        "Supreme Commander of the Korean People’s Army"
                      ],
                      "inceptionDate": [
                        "1948"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q4330651"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-05-17T14:17:12",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-16T11:27:08",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            }
          ],
          "familyPerson": [
            {
              "id": "NK-9K3GFzw3BN9zxo6Y3PtBTt",
              "caption": "Family",
              "schema": "Family",
              "properties": {
                "relationship": [
                  "father"
                ],
                "relative": [
                  {
                    "id": "Q10665",
                    "caption": "Kim Jong-il",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "role.pol",
                        "mil",
                        "sanction.linked",
                        "role.rca"
                      ],
                      "name": [
                        "كيم چونج ايل",
                        "Кім Чэн Ір",
                        "Kim Dzong Il",
                        "كيم جونغ إل",
                        "کیم جونگ-ایل",
                        "Kim Džong Il",
                        "김정일",
                        "Kims Čenirs",
                        "Kim Çen İr",
                        "Kim Dzsongil",
                        "კიმ ჩენ ირი",
                        "کم جونگ ایل",
                        "金正日",
                        "Kim Jong Il",
                        "किम जोङ् इल",
                        "ಕಿಮ್ ಜೊಂಗ್",
                        "Kim Chŏng-il",
                        "Կիմ Ջոնգ Իլ",
                        "Ким Жөн Ил",
                        "কিম জং ইল",
                        "किम जोंग-इल",
                        "קים ג'ונג-איל",
                        "គីម ចុងអ៊ីល",
                        "Jong-il Kim",
                        "ကင်ဂျုံအီ",
                        "Ким Чен Ир",
                        "Kim Jong-il",
                        "Kim Čen Iras",
                        "Кім Чен Ір",
                        "Kim Čong-il",
                        "Κιμ Γιονγκ Ιλ",
                        "Ким Џонг Ил"
                      ],
                      "alias": [
                        "Chen Ir Kim",
                        "Ким Ден Ир",
                        "Yuri Irsenovich Kim",
                        "Kim Djeung Il",
                        "Čen Ir Kim",
                        "Chŏng-il Kim",
                        "Ким Чжонир",
                        "Юрий Ким",
                        "Shonichi Kin",
                        "Jong Il Kim",
                        "Amado Lider",
                        "Юрий Ирсенович Ким",
                        "Juri Irsenowitsch Kim",
                        "Ким Чжон Ир",
                        "Կիմ Չեն Իր",
                        "Kim Xhong-Il",
                        "Jurij Irsenovič Kim",
                        "Kim Cong-il",
                        "Ким, Юрий Ирсенович",
                        "Kim Čong Il",
                        "Ким Ченир",
                        "Kim Chen Ir",
                        "Cheng-jih Chin"
                      ],
                      "position": [
                        "Supreme Leader of North Korea (1994-2011)",
                        "member of the Supreme People's Assembly",
                        "Eternal leaders of North Korea",
                        "General Secretary of the Workers' Party of Korea (1997-2011)",
                        "President of the State Affairs Commission"
                      ],
                      "birthPlace": [
                        "Vyatskoye",
                        "Ussuriysk"
                      ],
                      "weakAlias": [
                        "キム・ジョンイル"
                      ],
                      "ethnicity": [
                        "Koreans"
                      ],
                      "lastName": [
                        "Kim"
                      ],
                      "wikipediaUrl": [
                        "https://enwiki.wikipedia.org/wiki/Kim_Jong_Il"
                      ],
                      "gender": [
                        "male"
                      ],
                      "citizenship": [
                        "kp"
                      ],
                      "birthDate": [
                        "1941-02-16",
                        "1942-02-16"
                      ],
                      "education": [
                        "Mangyongdae Revolutionary School",
                        "University of Malta",
                        "Kim Il-sung University (-1964)"
                      ],
                      "political": [
                        "Workers’ Party of Korea"
                      ],
                      "religion": [
                        "atheism"
                      ],
                      "title": [
                        "Great Leader"
                      ],
                      "wikidataId": [
                        "Q10665"
                      ],
                      "deathDate": [
                        "2011-12-17"
                      ],
                      "notes": [
                        "Supreme Leader of North Korea from 1994 to 2011"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-07-18T22:03:41",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2026-03-19T01:00:15"
                  }
                ],
                "person": [
                  "Q56226"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [
                "wd-p40-q10665-q56226",
                "wd-p22-q10665-q56226"
              ],
              "target": false,
              "first_seen": "2023-07-18T22:03:41",
              "last_seen": "2026-03-19T01:00:15",
              "last_change": "2026-01-06T19:04:42"
            },
            {
              "id": "NK-gjEW3yDPXKqfTQYGin3Vhf",
              "caption": "Family",
              "schema": "Family",
              "properties": {
                "person": [
                  "Q56226"
                ],
                "relative": [
                  {
                    "id": "Q14864448",
                    "caption": "Kim Ju Ae",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "sanction.linked",
                        "role.rca"
                      ],
                      "name": [
                        "קים ג'ו-אה",
                        "Kim Ju-ae",
                        "Κιμ Τζου-ε",
                        "Կիմ Ջու Է",
                        "Ким Джу Ае",
                        "Ким Чжу Э",
                        "کیم جو ئه",
                        "Кім Джу Э",
                        "Kim Dzsue",
                        "কিম জু-আয়",
                        "Kim Džu-ae",
                        "किम जु-ए",
                        "金主愛",
                        "كيم جو أي",
                        "Kim Ču-e",
                        "Kim Ju Ae",
                        "Кім Чжу Е",
                        "김주애"
                      ],
                      "citizenship": [
                        "kp"
                      ],
                      "alias": [
                        "Kim Xhu-ae"
                      ],
                      "wikipediaUrl": [
                        "https://enwiki.wikipedia.org/wiki/Kim_Ju_Ae"
                      ],
                      "wikidataId": [
                        "Q14864448"
                      ],
                      "lastName": [
                        "Kim"
                      ],
                      "birthDate": [
                        "2013-02-19"
                      ],
                      "birthPlace": [
                        "North Korea"
                      ],
                      "gender": [
                        "female"
                      ],
                      "notes": [
                        "daughter of North Korean leader Kim Jong-un and his wife Ri Sol-ju"
                      ],
                      "weakAlias": [
                        "金朱愛",
                        "キム・ジュエ"
                      ],
                      "firstName": [
                        "Ju-ae"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-07-18T22:03:41",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2026-03-18T22:17:58"
                  }
                ],
                "relationship": [
                  "child"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [
                "wd-p22-q14864448-q56226",
                "wd-p40-q14864448-q56226"
              ],
              "target": false,
              "first_seen": "2023-07-18T22:03:41",
              "last_seen": "2026-03-19T01:00:15",
              "last_change": "2026-01-06T19:04:42"
            }
          ],
          "sanctions": [
            {
              "id": "usgsa-dfdb7a44424dbf948b081fd26c6842b03637e1bd",
              "caption": "Reciprocal",
              "schema": "Sanction",
              "properties": {
                "country": [
                  "us"
                ],
                "startDate": [
                  "2016-07-06"
                ],
                "status": [
                  "Active"
                ],
                "entity": [
                  "Q56226"
                ],
                "program": [
                  "Reciprocal"
                ],
                "sourceUrl": [
                  "https://sam.gov/data-services/Exclusions/Public%20V2?privacy=Public"
                ],
                "summary": [
                  "Redacted for Security Reasons"
                ],
                "authority": [
                  "OFAC"
                ],
                "listingDate": [
                  "2025-02-18"
                ],
                "provisions": [
                  "Prohibition/Restriction"
                ]
              },
              "datasets": [
                "crime"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-30T15:36:11",
              "last_seen": "2026-05-12T14:38:55",
              "last_change": "2026-03-30T15:36:11"
            },
            {
              "id": "ofac-9826e8b8ad44ae771182bfe4302d68e3ba937174",
              "caption": "DPRK3",
              "schema": "Sanction",
              "properties": {
                "summary": [
                  "Secondary sanctions risk: North Korea Sanctions Regulations, sections 510.201 and 510.210",
                  "Transactions Prohibited For Persons Owned or Controlled By U.S. Financial Institutions: North Korea Sanctions Regulations section 510.214"
                ],
                "authorityId": [
                  "20157"
                ],
                "sourceUrl": [
                  "https://www.treasury.gov/resource-center/sanctions/Pages/default.aspx"
                ],
                "programId": [
                  "US-NK"
                ],
                "authority": [
                  "Office of Foreign Assets Control"
                ],
                "programUrl": [
                  "https://ofac.treasury.gov/sanctions-programs-and-country-information/north-korea-sanctions"
                ],
                "provisions": [
                  "DPRK3",
                  "Block"
                ],
                "country": [
                  "us"
                ],
                "program": [
                  "DPRK3"
                ],
                "reason": [
                  "Executive Order 13722 (North Korea)"
                ],
                "entity": [
                  "Q56226"
                ]
              },
              "datasets": [
                "sanctions"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-04-20T10:27:20",
              "last_seen": "2026-05-13T06:10:01",
              "last_change": "2025-06-02T12:10:03"
            }
          ]
        },
        "datasets": [
          "core_watchlist"
        ],
        "referents": [
          "usgsa-s4mrvrpq3",
          "unprot-fb12498300bcbfba8019d11ba3dcc87e8d9e320f",
          "unprot-125bc3da6fc0f06b6ec23afc08221b2a5eead7a8",
          "unprot-720e6439b90ca1a7a8504f3a08215e7110adb231",
          "tw-shtc-1f22d6226a69d3a81acb1cb2789f479a175afe69",
          "evpo-ebbf5070-ae94-4ae9-9c7a-5645c6ce7bb0",
          "us-cia-korea-north-kim-jong-un-state-affairs-commission-president",
          "us-cia-korea-north-kim-jong-un-president-state-affairs-commission-sac",
          "ofac-20157"
        ],
        "target": true,
        "first_seen": "2019-05-21T00:00:00",
        "last_seen": "2026-03-19T12:10:01",
        "last_change": "2026-03-19T01:00:15"
      }
    },
    {
      "match_id": "M-3",
      "entity_id": "Q56226",
      "schema_type": "Person",
      "caption": "Jong Un KIM",
      "aliases": [
        "Jong Un KIM"
      ],
      "score": 0.95,
      "risk_level": "HIGH",
      "topic_risk": 0.0,
      "primary_topic": null,
      "match_features": {
        "name_match": 1.0
      },
      "topics": [
        "debarment"
      ],
      "datasets": [
        "crime"
      ],
      "sources": [
        {
          "identifier": "crime",
          "title": "crime",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [],
      "nationalities": [],
      "countries": [
        "kp"
      ],
      "id_numbers": [],
      "positions": [],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/Q56226/",
      "status": "potential",
      "deep_dive": {
        "id": "Q56226",
        "caption": "Kim Jong-un",
        "schema": "Person",
        "properties": {
          "classification": [
            "National government (current)"
          ],
          "alias": [
            "Kim Cong un",
            "کم جونگ اُن",
            "كم جونغ أون",
            "Կիմ Ջոնգ Ուն",
            "Ким Чен Ун",
            "Kim Džiuong Un",
            "Kîm Ngit-sṳ̀n",
            "Κιμ Τζονγκ-ουν",
            "ကင်ဂျုံအွန်",
            "Ким Чжон Ун",
            "Kim Jong Eun",
            "Kim Jong-Eun",
            "किम जोङ उन",
            "Kim Jung-Woon",
            "คิม จ็อง-อึน",
            "Kim Jung Woon",
            "Ким Џонг Ун",
            "Kim Čong-un",
            "קים דשאנג און",
            "Kim Xhong-Un",
            "Kim Džongunas",
            "Kim Yong Un",
            "קים ג'ונג-און",
            "Gĭng Céng-ŏng",
            "Gim Jeong-eun",
            "கிம் ஜொங்-உன்",
            "Kim Jong Un",
            "金正恩",
            "Кім Чэн Ын",
            "Ким Ден Ын",
            "Kim Jung-eun",
            "किम जोङ्ग उन",
            "Кім Чен Ин",
            "Kim Jong-Woon",
            "ኪም ጆንግ ኡን",
            "Kim Dzsongun",
            "Jong Un Kim",
            "Kim Jong-oen",
            "كيم جونغ اون",
            "Ким Чжон Ын",
            "کیم جونق-اون",
            "კიმ ჩენ ინი",
            "Kim Çen In",
            "کیم جونگ اون",
            "کیم جونگ-اون",
            "Κιμ Γιονγκ Ουν",
            "Kims Čonins",
            "Ким Чен Ир",
            "কিম জং উন",
            "کم جونگ اون",
            "Kim Chèng-un",
            "ಕಿಮ್ ಜೋಂಗ್ ಅನ್",
            "Kim Çžon Yn",
            "Kim Chŏng-un",
            "Kim Džong-un",
            "ਕਿਮ ਜੋਂਗ ਉਨ",
            "김정은",
            "Kim Dzong Un",
            "Kim Ĝong-un",
            "കിം ജോങ് യുൻ",
            "كيم چونج اون",
            "Ким Чен Ын",
            "ຄິມ ຈອງ-ອຶນ",
            "කිම් ජොං අං",
            "Mariscal Kim Jong-un",
            "Ким Джонъын",
            "किम जोंग-उन",
            "किम जोंग उन",
            "Kim Jong Woon",
            "کیم جۆنگ ئون"
          ],
          "position": [
            "General Secretary of the Workers' Party of Korea (2012-)",
            "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
            "Supreme People’s Assembly (member, 2014-)",
            "member of the Supreme People's Assembly",
            "President of the State Affairs Commission (2012-)",
            "Supreme Commander of the Korean People’s Army (2011-)",
            "Supreme Leader of North Korea (2011-)",
            "member of the Presidium of the Politburo of the Workers' Party of Korea",
            "Chairman of the Workers' Party of Korea",
            "President, State Affairs Commission (SAC)"
          ],
          "topics": [
            "export.control",
            "sanction",
            "role.pep",
            "role.pol",
            "role.rca",
            "debarment"
          ],
          "country": [
            "kp"
          ],
          "lastName": [
            "Kim"
          ],
          "birthDate": [
            "1982-01-08",
            "1984-01-08",
            "1983-01-08"
          ],
          "firstName": [
            "Jong Un",
            "Jung-eun"
          ],
          "wikidataId": [
            "Q56226"
          ],
          "citizenship": [
            "kp"
          ],
          "name": [
            "Կիմ Ջոնգ Ուն",
            "किम जोङ उन",
            "Ким Чен Ун",
            "ကင်ဂျုံအွန်",
            "كيم جونغ أون",
            "Ким Џонг Ун",
            "Kim Čong-un",
            "KIM, Jong Un",
            "Kim Xhong-Un",
            "Kim Džongunas",
            "קים ג'ונג-און",
            "Kim Jong Un",
            "金正恩",
            "Кім Чэн Ын",
            "Кім Чен Ин",
            "Kim Dzsongun",
            "Jong Un Kim",
            "კიმ ჩენ ინი",
            "Kim Džong Un",
            "Kim Çen In",
            "کیم جونگ-اون",
            "Kims Čonins",
            "কিম জং উন",
            "Ким Чен Ир",
            "کم جونگ اون",
            "Kim Çžon Yn",
            "Kim Chŏng-un",
            "김정은",
            "Kim Dzong Un",
            "كيم چونج اون",
            "Ким Чен Ын",
            "Kim Jong-un",
            "Κιμ Γιονγκ-ουν",
            "किम जोंग उन",
            "គីម ចុងអ៊ឺន"
          ],
          "address": [
            "Korea, North"
          ],
          "title": [
            "His Excellency"
          ],
          "sourceUrl": [
            "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=20157",
            "https://www.cia.gov/resources/world-leaders/foreign-governments/korea-north"
          ],
          "programId": [
            "US-NK"
          ],
          "uniqueEntityId": [
            "RVAXCBRK2CF4"
          ],
          "createdAt": [
            "2025-02-18"
          ],
          "political": [
            "Workers’ Party of Korea"
          ],
          "weakAlias": [
            "キム・ジョンウン",
            "김정운",
            "Pak Un",
            "KJU",
            "Josef Pwag"
          ],
          "education": [
            "Liebefeld-Steinhölzli State School",
            "Kim Il-sung Military University",
            "Kim Il-sung University"
          ],
          "ethnicity": [
            "Koreans"
          ],
          "gender": [
            "male"
          ],
          "birthPlace": [
            "Changsong County",
            "Wonsan",
            "Chagang Province",
            "Samjiyon"
          ],
          "notes": [
            "Supreme Leader of North Korea since 2011"
          ],
          "wikipediaUrl": [
            "https://enwiki.wikipedia.org/wiki/Kim_Jong_Un"
          ],
          "religion": [
            "atheism"
          ],
          "positionOccupancies": [
            {
              "id": "us-cia-0c8901dcb8401a819414e13a4e25b7c879f529cc",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "NK-Gff54J9WeGZvohynbfbcG5",
                    "caption": "President, State Affairs Commission (SAC)",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "country": [
                        "kp"
                      ],
                      "name": [
                        "President, State Affairs Commission (SAC)"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "us-cia-5ae3250e80b229d72631988c90c20d6e51503cfd",
                      "us-cia-1fa55f154296125d72f31f7105e64b577d91150a"
                    ],
                    "target": false,
                    "first_seen": "2023-08-16T06:02:46",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2025-03-28T14:19:13"
                  }
                ],
                "status": [
                  "current"
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-10-11T11:06:37",
              "last_seen": "2026-05-11T21:57:21",
              "last_change": "2024-10-11T11:06:37"
            },
            {
              "id": "NK-6fA5S6A6NSD9DVa7ZQ2HPa",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "Q21328639",
                    "caption": "member of the Supreme People's Assembly",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.legislative",
                        "gov.national"
                      ],
                      "name": [
                        "Member of the Supreme People’s Assembly",
                        "member of the Supreme People's Assembly",
                        "Member of the Supreme People's Assembly"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q21328639"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "wd-9a973f096c46b3d568863b457f35fb1df292d823",
                      "evpo-d0871dd4afc460ebc7553770dd3d430058bb656e"
                    ],
                    "target": false,
                    "first_seen": "2019-05-21T00:00:00",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-db282956c1eb662a56e8e684e59289231448a20c",
                "evpo-1ed262a4866f8ac9cb96ce244f6339544eaa0916",
                "wd-58743badf27a05f8e5b457507f80af852535e7be"
              ],
              "target": false,
              "first_seen": "2019-05-21T00:00:00",
              "last_seen": "2026-05-08T13:17:18",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "wd-6e3d3adba0792644a83df6b62f64792267e90905",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q707631",
                    "caption": "General Secretary of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "inceptionDate": [
                        "2016-05-09"
                      ],
                      "name": [
                        "General Secretary of the Workers' Party of Korea"
                      ],
                      "wikidataId": [
                        "Q707631"
                      ],
                      "country": [
                        "kp"
                      ],
                      "subnationalArea": [
                        "Workers’ Party of Korea"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-16T11:27:08",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-DUfTtjRJnTZT62EQSFB2ic",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q56876342",
                    "caption": "Supreme Leader of North Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "name": [
                        "Supreme Leader of North Korea"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q56876342"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "startDate": [
                  "2011-12-17"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-7b1806dfa742826ba192e78ef79254ecea7654ac",
                "wd-cb23683d9955b19ad286790689aee08685e204ca"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-YKWfKn7pwATkyvgTfdeVJp",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q4330651",
                    "caption": "Supreme Commander of the Korean People’s Army",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.national",
                        "gov.security"
                      ],
                      "name": [
                        "Supreme Commander of the Korean People’s Army"
                      ],
                      "inceptionDate": [
                        "1948"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q4330651"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-05-17T14:17:12",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "startDate": [
                  "2011-12-17"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-aa89e6af4b156edbb20bb4b122efcbbf8313a7cb",
                "wd-e7ce76ea2b0b3e133f943a0bbf24c38169d2b361"
              ],
              "target": false,
              "first_seen": "2025-06-14T14:45:34",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-YNKdDFGEm3bcK32SKEFJtn",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "sourceUrl": [
                  "https://nkinfo.unikorea.go.kr/nkp/theme/getPowerStructureDang.do"
                ],
                "post": [
                  {
                    "id": "Q98801004",
                    "caption": "member of the Presidium of the Politburo of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "wikidataId": [
                        "Q98801004"
                      ],
                      "name": [
                        "member of the Presidium of the Politburo of the Workers' Party of Korea"
                      ],
                      "country": [
                        "kp"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2025-05-17T12:48:05",
                    "last_seen": "2026-05-06T03:53:24",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-2835326d627ad9558fdcc2ae71078a63a8f22a90",
                "wd-3547f3c79b97fb27469a30dbc6a33975ee86d51f"
              ],
              "target": false,
              "first_seen": "2025-05-17T12:48:05",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-04-08T00:13:25"
            },
            {
              "id": "NK-jJDaRr3oF2C9qpZSR2KMky",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "startDate": [
                  "2012-04-11"
                ],
                "post": [
                  {
                    "id": "Q707631",
                    "caption": "General Secretary of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "inceptionDate": [
                        "2016-05-09"
                      ],
                      "name": [
                        "General Secretary of the Workers' Party of Korea"
                      ],
                      "wikidataId": [
                        "Q707631"
                      ],
                      "country": [
                        "kp"
                      ],
                      "subnationalArea": [
                        "Workers’ Party of Korea"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-13b05efde16546d867431dd6f02f5f69285ddd84",
                "wd-e9e93623a5dec3bc9cf7e46be5907e63b7602537"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "unprot-e296186a12331d553e50016bf0d745e66ee35511",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "unprot-97c2b5f685cac5d9c0e6f60e1ba059c1d0728a44",
                    "caption": "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
                    "schema": "Position",
                    "properties": {
                      "name": [
                        "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea"
                      ],
                      "topics": [
                        "gov.national"
                      ],
                      "country": [
                        "kp"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2026-02-15T14:12:06",
                    "last_seen": "2026-04-26T13:01:02",
                    "last_change": "2026-02-15T14:12:06"
                  }
                ],
                "status": [
                  "current"
                ],
                "startDate": [
                  "2012-03-08"
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-02-15T14:12:06",
              "last_seen": "2026-04-26T13:01:02",
              "last_change": "2026-02-15T14:12:06"
            },
            {
              "id": "wd-1964016e0b84bfc3f196a2977f35f15680a22f92",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "Q4330651",
                    "caption": "Supreme Commander of the Korean People’s Army",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.national",
                        "gov.security"
                      ],
                      "name": [
                        "Supreme Commander of the Korean People’s Army"
                      ],
                      "inceptionDate": [
                        "1948"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q4330651"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-05-17T14:17:12",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-16T11:27:08",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            }
          ],
          "familyPerson": [
            {
              "id": "NK-9K3GFzw3BN9zxo6Y3PtBTt",
              "caption": "Family",
              "schema": "Family",
              "properties": {
                "relationship": [
                  "father"
                ],
                "relative": [
                  {
                    "id": "Q10665",
                    "caption": "Kim Jong-il",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "role.pol",
                        "mil",
                        "sanction.linked",
                        "role.rca"
                      ],
                      "name": [
                        "كيم چونج ايل",
                        "Кім Чэн Ір",
                        "Kim Dzong Il",
                        "كيم جونغ إل",
                        "کیم جونگ-ایل",
                        "Kim Džong Il",
                        "김정일",
                        "Kims Čenirs",
                        "Kim Çen İr",
                        "Kim Dzsongil",
                        "კიმ ჩენ ირი",
                        "کم جونگ ایل",
                        "金正日",
                        "Kim Jong Il",
                        "किम जोङ् इल",
                        "ಕಿಮ್ ಜೊಂಗ್",
                        "Kim Chŏng-il",
                        "Կիմ Ջոնգ Իլ",
                        "Ким Жөн Ил",
                        "কিম জং ইল",
                        "किम जोंग-इल",
                        "קים ג'ונג-איל",
                        "គីម ចុងអ៊ីល",
                        "Jong-il Kim",
                        "ကင်ဂျုံအီ",
                        "Ким Чен Ир",
                        "Kim Jong-il",
                        "Kim Čen Iras",
                        "Кім Чен Ір",
                        "Kim Čong-il",
                        "Κιμ Γιονγκ Ιλ",
                        "Ким Џонг Ил"
                      ],
                      "alias": [
                        "Chen Ir Kim",
                        "Ким Ден Ир",
                        "Yuri Irsenovich Kim",
                        "Kim Djeung Il",
                        "Čen Ir Kim",
                        "Chŏng-il Kim",
                        "Ким Чжонир",
                        "Юрий Ким",
                        "Shonichi Kin",
                        "Jong Il Kim",
                        "Amado Lider",
                        "Юрий Ирсенович Ким",
                        "Juri Irsenowitsch Kim",
                        "Ким Чжон Ир",
                        "Կիմ Չեն Իր",
                        "Kim Xhong-Il",
                        "Jurij Irsenovič Kim",
                        "Kim Cong-il",
                        "Ким, Юрий Ирсенович",
                        "Kim Čong Il",
                        "Ким Ченир",
                        "Kim Chen Ir",
                        "Cheng-jih Chin"
                      ],
                      "position": [
                        "Supreme Leader of North Korea (1994-2011)",
                        "member of the Supreme People's Assembly",
                        "Eternal leaders of North Korea",
                        "General Secretary of the Workers' Party of Korea (1997-2011)",
                        "President of the State Affairs Commission"
                      ],
                      "birthPlace": [
                        "Vyatskoye",
                        "Ussuriysk"
                      ],
                      "weakAlias": [
                        "キム・ジョンイル"
                      ],
                      "ethnicity": [
                        "Koreans"
                      ],
                      "lastName": [
                        "Kim"
                      ],
                      "wikipediaUrl": [
                        "https://enwiki.wikipedia.org/wiki/Kim_Jong_Il"
                      ],
                      "gender": [
                        "male"
                      ],
                      "citizenship": [
                        "kp"
                      ],
                      "birthDate": [
                        "1941-02-16",
                        "1942-02-16"
                      ],
                      "education": [
                        "Mangyongdae Revolutionary School",
                        "University of Malta",
                        "Kim Il-sung University (-1964)"
                      ],
                      "political": [
                        "Workers’ Party of Korea"
                      ],
                      "religion": [
                        "atheism"
                      ],
                      "title": [
                        "Great Leader"
                      ],
                      "wikidataId": [
                        "Q10665"
                      ],
                      "deathDate": [
                        "2011-12-17"
                      ],
                      "notes": [
                        "Supreme Leader of North Korea from 1994 to 2011"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-07-18T22:03:41",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2026-03-19T01:00:15"
                  }
                ],
                "person": [
                  "Q56226"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [
                "wd-p40-q10665-q56226",
                "wd-p22-q10665-q56226"
              ],
              "target": false,
              "first_seen": "2023-07-18T22:03:41",
              "last_seen": "2026-03-19T01:00:15",
              "last_change": "2026-01-06T19:04:42"
            },
            {
              "id": "NK-gjEW3yDPXKqfTQYGin3Vhf",
              "caption": "Family",
              "schema": "Family",
              "properties": {
                "person": [
                  "Q56226"
                ],
                "relative": [
                  {
                    "id": "Q14864448",
                    "caption": "Kim Ju Ae",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "sanction.linked",
                        "role.rca"
                      ],
                      "name": [
                        "קים ג'ו-אה",
                        "Kim Ju-ae",
                        "Κιμ Τζου-ε",
                        "Կիմ Ջու Է",
                        "Ким Джу Ае",
                        "Ким Чжу Э",
                        "کیم جو ئه",
                        "Кім Джу Э",
                        "Kim Dzsue",
                        "কিম জু-আয়",
                        "Kim Džu-ae",
                        "किम जु-ए",
                        "金主愛",
                        "كيم جو أي",
                        "Kim Ču-e",
                        "Kim Ju Ae",
                        "Кім Чжу Е",
                        "김주애"
                      ],
                      "citizenship": [
                        "kp"
                      ],
                      "alias": [
                        "Kim Xhu-ae"
                      ],
                      "wikipediaUrl": [
                        "https://enwiki.wikipedia.org/wiki/Kim_Ju_Ae"
                      ],
                      "wikidataId": [
                        "Q14864448"
                      ],
                      "lastName": [
                        "Kim"
                      ],
                      "birthDate": [
                        "2013-02-19"
                      ],
                      "birthPlace": [
                        "North Korea"
                      ],
                      "gender": [
                        "female"
                      ],
                      "notes": [
                        "daughter of North Korean leader Kim Jong-un and his wife Ri Sol-ju"
                      ],
                      "weakAlias": [
                        "金朱愛",
                        "キム・ジュエ"
                      ],
                      "firstName": [
                        "Ju-ae"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-07-18T22:03:41",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2026-03-18T22:17:58"
                  }
                ],
                "relationship": [
                  "child"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [
                "wd-p22-q14864448-q56226",
                "wd-p40-q14864448-q56226"
              ],
              "target": false,
              "first_seen": "2023-07-18T22:03:41",
              "last_seen": "2026-03-19T01:00:15",
              "last_change": "2026-01-06T19:04:42"
            }
          ],
          "sanctions": [
            {
              "id": "usgsa-dfdb7a44424dbf948b081fd26c6842b03637e1bd",
              "caption": "Reciprocal",
              "schema": "Sanction",
              "properties": {
                "country": [
                  "us"
                ],
                "startDate": [
                  "2016-07-06"
                ],
                "status": [
                  "Active"
                ],
                "entity": [
                  "Q56226"
                ],
                "program": [
                  "Reciprocal"
                ],
                "sourceUrl": [
                  "https://sam.gov/data-services/Exclusions/Public%20V2?privacy=Public"
                ],
                "summary": [
                  "Redacted for Security Reasons"
                ],
                "authority": [
                  "OFAC"
                ],
                "listingDate": [
                  "2025-02-18"
                ],
                "provisions": [
                  "Prohibition/Restriction"
                ]
              },
              "datasets": [
                "crime"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-30T15:36:11",
              "last_seen": "2026-05-12T14:38:55",
              "last_change": "2026-03-30T15:36:11"
            },
            {
              "id": "ofac-9826e8b8ad44ae771182bfe4302d68e3ba937174",
              "caption": "DPRK3",
              "schema": "Sanction",
              "properties": {
                "summary": [
                  "Secondary sanctions risk: North Korea Sanctions Regulations, sections 510.201 and 510.210",
                  "Transactions Prohibited For Persons Owned or Controlled By U.S. Financial Institutions: North Korea Sanctions Regulations section 510.214"
                ],
                "authorityId": [
                  "20157"
                ],
                "sourceUrl": [
                  "https://www.treasury.gov/resource-center/sanctions/Pages/default.aspx"
                ],
                "programId": [
                  "US-NK"
                ],
                "authority": [
                  "Office of Foreign Assets Control"
                ],
                "programUrl": [
                  "https://ofac.treasury.gov/sanctions-programs-and-country-information/north-korea-sanctions"
                ],
                "provisions": [
                  "DPRK3",
                  "Block"
                ],
                "country": [
                  "us"
                ],
                "program": [
                  "DPRK3"
                ],
                "reason": [
                  "Executive Order 13722 (North Korea)"
                ],
                "entity": [
                  "Q56226"
                ]
              },
              "datasets": [
                "sanctions"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-04-20T10:27:20",
              "last_seen": "2026-05-13T06:10:01",
              "last_change": "2025-06-02T12:10:03"
            }
          ]
        },
        "datasets": [
          "core_watchlist"
        ],
        "referents": [
          "usgsa-s4mrvrpq3",
          "unprot-fb12498300bcbfba8019d11ba3dcc87e8d9e320f",
          "unprot-125bc3da6fc0f06b6ec23afc08221b2a5eead7a8",
          "unprot-720e6439b90ca1a7a8504f3a08215e7110adb231",
          "tw-shtc-1f22d6226a69d3a81acb1cb2789f479a175afe69",
          "evpo-ebbf5070-ae94-4ae9-9c7a-5645c6ce7bb0",
          "us-cia-korea-north-kim-jong-un-state-affairs-commission-president",
          "us-cia-korea-north-kim-jong-un-president-state-affairs-commission-sac",
          "ofac-20157"
        ],
        "target": true,
        "first_seen": "2019-05-21T00:00:00",
        "last_seen": "2026-03-19T12:10:01",
        "last_change": "2026-03-19T01:00:15"
      }
    },
    {
      "match_id": "M-4",
      "entity_id": "Q56226",
      "schema_type": "Person",
      "caption": "Kim Jong-un",
      "aliases": [
        "Kim Jong Un",
        "Kim Jong-un"
      ],
      "score": 0.95,
      "risk_level": "HIGH",
      "topic_risk": 0.6,
      "primary_topic": "role.pep",
      "match_features": {
        "name_match": 1.0
      },
      "topics": [
        "role.pep"
      ],
      "datasets": [
        "peps"
      ],
      "sources": [
        {
          "identifier": "peps",
          "title": "peps",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [
        "1982-01-08",
        "1983-01-08",
        "1984-01-08"
      ],
      "nationalities": [],
      "countries": [
        "kp"
      ],
      "id_numbers": [],
      "positions": [
        "President, State Affairs Commission (SAC)",
        "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
        "Supreme People’s Assembly (member, 2014-)"
      ],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/Q56226/",
      "status": "potential",
      "deep_dive": {
        "id": "Q56226",
        "caption": "Kim Jong-un",
        "schema": "Person",
        "properties": {
          "classification": [
            "National government (current)"
          ],
          "alias": [
            "Kim Cong un",
            "کم جونگ اُن",
            "كم جونغ أون",
            "Կիմ Ջոնգ Ուն",
            "Ким Чен Ун",
            "Kim Džiuong Un",
            "Kîm Ngit-sṳ̀n",
            "Κιμ Τζονγκ-ουν",
            "ကင်ဂျုံအွန်",
            "Ким Чжон Ун",
            "Kim Jong Eun",
            "Kim Jong-Eun",
            "किम जोङ उन",
            "Kim Jung-Woon",
            "คิม จ็อง-อึน",
            "Kim Jung Woon",
            "Ким Џонг Ун",
            "Kim Čong-un",
            "קים דשאנג און",
            "Kim Xhong-Un",
            "Kim Džongunas",
            "Kim Yong Un",
            "קים ג'ונג-און",
            "Gĭng Céng-ŏng",
            "Gim Jeong-eun",
            "கிம் ஜொங்-உன்",
            "Kim Jong Un",
            "金正恩",
            "Кім Чэн Ын",
            "Ким Ден Ын",
            "Kim Jung-eun",
            "किम जोङ्ग उन",
            "Кім Чен Ин",
            "Kim Jong-Woon",
            "ኪም ጆንግ ኡን",
            "Kim Dzsongun",
            "Jong Un Kim",
            "Kim Jong-oen",
            "كيم جونغ اون",
            "Ким Чжон Ын",
            "کیم جونق-اون",
            "კიმ ჩენ ინი",
            "Kim Çen In",
            "کیم جونگ اون",
            "کیم جونگ-اون",
            "Κιμ Γιονγκ Ουν",
            "Kims Čonins",
            "Ким Чен Ир",
            "কিম জং উন",
            "کم جونگ اون",
            "Kim Chèng-un",
            "ಕಿಮ್ ಜೋಂಗ್ ಅನ್",
            "Kim Çžon Yn",
            "Kim Chŏng-un",
            "Kim Džong-un",
            "ਕਿਮ ਜੋਂਗ ਉਨ",
            "김정은",
            "Kim Dzong Un",
            "Kim Ĝong-un",
            "കിം ജോങ് യുൻ",
            "كيم چونج اون",
            "Ким Чен Ын",
            "ຄິມ ຈອງ-ອຶນ",
            "කිම් ජොං අං",
            "Mariscal Kim Jong-un",
            "Ким Джонъын",
            "किम जोंग-उन",
            "किम जोंग उन",
            "Kim Jong Woon",
            "کیم جۆنگ ئون"
          ],
          "position": [
            "General Secretary of the Workers' Party of Korea (2012-)",
            "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
            "Supreme People’s Assembly (member, 2014-)",
            "member of the Supreme People's Assembly",
            "President of the State Affairs Commission (2012-)",
            "Supreme Commander of the Korean People’s Army (2011-)",
            "Supreme Leader of North Korea (2011-)",
            "member of the Presidium of the Politburo of the Workers' Party of Korea",
            "Chairman of the Workers' Party of Korea",
            "President, State Affairs Commission (SAC)"
          ],
          "topics": [
            "export.control",
            "sanction",
            "role.pep",
            "role.pol",
            "role.rca",
            "debarment"
          ],
          "country": [
            "kp"
          ],
          "lastName": [
            "Kim"
          ],
          "birthDate": [
            "1982-01-08",
            "1984-01-08",
            "1983-01-08"
          ],
          "firstName": [
            "Jong Un",
            "Jung-eun"
          ],
          "wikidataId": [
            "Q56226"
          ],
          "citizenship": [
            "kp"
          ],
          "name": [
            "Կիմ Ջոնգ Ուն",
            "किम जोङ उन",
            "Ким Чен Ун",
            "ကင်ဂျုံအွန်",
            "كيم جونغ أون",
            "Ким Џонг Ун",
            "Kim Čong-un",
            "KIM, Jong Un",
            "Kim Xhong-Un",
            "Kim Džongunas",
            "קים ג'ונג-און",
            "Kim Jong Un",
            "金正恩",
            "Кім Чэн Ын",
            "Кім Чен Ин",
            "Kim Dzsongun",
            "Jong Un Kim",
            "კიმ ჩენ ინი",
            "Kim Džong Un",
            "Kim Çen In",
            "کیم جونگ-اون",
            "Kims Čonins",
            "কিম জং উন",
            "Ким Чен Ир",
            "کم جونگ اون",
            "Kim Çžon Yn",
            "Kim Chŏng-un",
            "김정은",
            "Kim Dzong Un",
            "كيم چونج اون",
            "Ким Чен Ын",
            "Kim Jong-un",
            "Κιμ Γιονγκ-ουν",
            "किम जोंग उन",
            "គីម ចុងអ៊ឺន"
          ],
          "address": [
            "Korea, North"
          ],
          "title": [
            "His Excellency"
          ],
          "sourceUrl": [
            "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=20157",
            "https://www.cia.gov/resources/world-leaders/foreign-governments/korea-north"
          ],
          "programId": [
            "US-NK"
          ],
          "uniqueEntityId": [
            "RVAXCBRK2CF4"
          ],
          "createdAt": [
            "2025-02-18"
          ],
          "political": [
            "Workers’ Party of Korea"
          ],
          "weakAlias": [
            "キム・ジョンウン",
            "김정운",
            "Pak Un",
            "KJU",
            "Josef Pwag"
          ],
          "education": [
            "Liebefeld-Steinhölzli State School",
            "Kim Il-sung Military University",
            "Kim Il-sung University"
          ],
          "ethnicity": [
            "Koreans"
          ],
          "gender": [
            "male"
          ],
          "birthPlace": [
            "Changsong County",
            "Wonsan",
            "Chagang Province",
            "Samjiyon"
          ],
          "notes": [
            "Supreme Leader of North Korea since 2011"
          ],
          "wikipediaUrl": [
            "https://enwiki.wikipedia.org/wiki/Kim_Jong_Un"
          ],
          "religion": [
            "atheism"
          ],
          "positionOccupancies": [
            {
              "id": "us-cia-0c8901dcb8401a819414e13a4e25b7c879f529cc",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "NK-Gff54J9WeGZvohynbfbcG5",
                    "caption": "President, State Affairs Commission (SAC)",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "country": [
                        "kp"
                      ],
                      "name": [
                        "President, State Affairs Commission (SAC)"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "us-cia-5ae3250e80b229d72631988c90c20d6e51503cfd",
                      "us-cia-1fa55f154296125d72f31f7105e64b577d91150a"
                    ],
                    "target": false,
                    "first_seen": "2023-08-16T06:02:46",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2025-03-28T14:19:13"
                  }
                ],
                "status": [
                  "current"
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-10-11T11:06:37",
              "last_seen": "2026-05-11T21:57:21",
              "last_change": "2024-10-11T11:06:37"
            },
            {
              "id": "NK-6fA5S6A6NSD9DVa7ZQ2HPa",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "Q21328639",
                    "caption": "member of the Supreme People's Assembly",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.legislative",
                        "gov.national"
                      ],
                      "name": [
                        "Member of the Supreme People’s Assembly",
                        "member of the Supreme People's Assembly",
                        "Member of the Supreme People's Assembly"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q21328639"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "wd-9a973f096c46b3d568863b457f35fb1df292d823",
                      "evpo-d0871dd4afc460ebc7553770dd3d430058bb656e"
                    ],
                    "target": false,
                    "first_seen": "2019-05-21T00:00:00",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-db282956c1eb662a56e8e684e59289231448a20c",
                "evpo-1ed262a4866f8ac9cb96ce244f6339544eaa0916",
                "wd-58743badf27a05f8e5b457507f80af852535e7be"
              ],
              "target": false,
              "first_seen": "2019-05-21T00:00:00",
              "last_seen": "2026-05-08T13:17:18",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "wd-6e3d3adba0792644a83df6b62f64792267e90905",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q707631",
                    "caption": "General Secretary of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "inceptionDate": [
                        "2016-05-09"
                      ],
                      "name": [
                        "General Secretary of the Workers' Party of Korea"
                      ],
                      "wikidataId": [
                        "Q707631"
                      ],
                      "country": [
                        "kp"
                      ],
                      "subnationalArea": [
                        "Workers’ Party of Korea"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-16T11:27:08",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-DUfTtjRJnTZT62EQSFB2ic",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q56876342",
                    "caption": "Supreme Leader of North Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "name": [
                        "Supreme Leader of North Korea"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q56876342"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "startDate": [
                  "2011-12-17"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-7b1806dfa742826ba192e78ef79254ecea7654ac",
                "wd-cb23683d9955b19ad286790689aee08685e204ca"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-YKWfKn7pwATkyvgTfdeVJp",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q4330651",
                    "caption": "Supreme Commander of the Korean People’s Army",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.national",
                        "gov.security"
                      ],
                      "name": [
                        "Supreme Commander of the Korean People’s Army"
                      ],
                      "inceptionDate": [
                        "1948"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q4330651"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-05-17T14:17:12",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "startDate": [
                  "2011-12-17"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-aa89e6af4b156edbb20bb4b122efcbbf8313a7cb",
                "wd-e7ce76ea2b0b3e133f943a0bbf24c38169d2b361"
              ],
              "target": false,
              "first_seen": "2025-06-14T14:45:34",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-YNKdDFGEm3bcK32SKEFJtn",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "sourceUrl": [
                  "https://nkinfo.unikorea.go.kr/nkp/theme/getPowerStructureDang.do"
                ],
                "post": [
                  {
                    "id": "Q98801004",
                    "caption": "member of the Presidium of the Politburo of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "wikidataId": [
                        "Q98801004"
                      ],
                      "name": [
                        "member of the Presidium of the Politburo of the Workers' Party of Korea"
                      ],
                      "country": [
                        "kp"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2025-05-17T12:48:05",
                    "last_seen": "2026-05-06T03:53:24",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-2835326d627ad9558fdcc2ae71078a63a8f22a90",
                "wd-3547f3c79b97fb27469a30dbc6a33975ee86d51f"
              ],
              "target": false,
              "first_seen": "2025-05-17T12:48:05",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-04-08T00:13:25"
            },
            {
              "id": "NK-jJDaRr3oF2C9qpZSR2KMky",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "startDate": [
                  "2012-04-11"
                ],
                "post": [
                  {
                    "id": "Q707631",
                    "caption": "General Secretary of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "inceptionDate": [
                        "2016-05-09"
                      ],
                      "name": [
                        "General Secretary of the Workers' Party of Korea"
                      ],
                      "wikidataId": [
                        "Q707631"
                      ],
                      "country": [
                        "kp"
                      ],
                      "subnationalArea": [
                        "Workers’ Party of Korea"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-13b05efde16546d867431dd6f02f5f69285ddd84",
                "wd-e9e93623a5dec3bc9cf7e46be5907e63b7602537"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "unprot-e296186a12331d553e50016bf0d745e66ee35511",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "unprot-97c2b5f685cac5d9c0e6f60e1ba059c1d0728a44",
                    "caption": "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
                    "schema": "Position",
                    "properties": {
                      "name": [
                        "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea"
                      ],
                      "topics": [
                        "gov.national"
                      ],
                      "country": [
                        "kp"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2026-02-15T14:12:06",
                    "last_seen": "2026-04-26T13:01:02",
                    "last_change": "2026-02-15T14:12:06"
                  }
                ],
                "status": [
                  "current"
                ],
                "startDate": [
                  "2012-03-08"
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-02-15T14:12:06",
              "last_seen": "2026-04-26T13:01:02",
              "last_change": "2026-02-15T14:12:06"
            },
            {
              "id": "wd-1964016e0b84bfc3f196a2977f35f15680a22f92",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "Q4330651",
                    "caption": "Supreme Commander of the Korean People’s Army",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.national",
                        "gov.security"
                      ],
                      "name": [
                        "Supreme Commander of the Korean People’s Army"
                      ],
                      "inceptionDate": [
                        "1948"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q4330651"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-05-17T14:17:12",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-16T11:27:08",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            }
          ],
          "familyPerson": [
            {
              "id": "NK-9K3GFzw3BN9zxo6Y3PtBTt",
              "caption": "Family",
              "schema": "Family",
              "properties": {
                "relationship": [
                  "father"
                ],
                "relative": [
                  {
                    "id": "Q10665",
                    "caption": "Kim Jong-il",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "role.pol",
                        "mil",
                        "sanction.linked",
                        "role.rca"
                      ],
                      "name": [
                        "كيم چونج ايل",
                        "Кім Чэн Ір",
                        "Kim Dzong Il",
                        "كيم جونغ إل",
                        "کیم جونگ-ایل",
                        "Kim Džong Il",
                        "김정일",
                        "Kims Čenirs",
                        "Kim Çen İr",
                        "Kim Dzsongil",
                        "კიმ ჩენ ირი",
                        "کم جونگ ایل",
                        "金正日",
                        "Kim Jong Il",
                        "किम जोङ् इल",
                        "ಕಿಮ್ ಜೊಂಗ್",
                        "Kim Chŏng-il",
                        "Կիմ Ջոնգ Իլ",
                        "Ким Жөн Ил",
                        "কিম জং ইল",
                        "किम जोंग-इल",
                        "קים ג'ונג-איל",
                        "គីម ចុងអ៊ីល",
                        "Jong-il Kim",
                        "ကင်ဂျုံအီ",
                        "Ким Чен Ир",
                        "Kim Jong-il",
                        "Kim Čen Iras",
                        "Кім Чен Ір",
                        "Kim Čong-il",
                        "Κιμ Γιονγκ Ιλ",
                        "Ким Џонг Ил"
                      ],
                      "alias": [
                        "Chen Ir Kim",
                        "Ким Ден Ир",
                        "Yuri Irsenovich Kim",
                        "Kim Djeung Il",
                        "Čen Ir Kim",
                        "Chŏng-il Kim",
                        "Ким Чжонир",
                        "Юрий Ким",
                        "Shonichi Kin",
                        "Jong Il Kim",
                        "Amado Lider",
                        "Юрий Ирсенович Ким",
                        "Juri Irsenowitsch Kim",
                        "Ким Чжон Ир",
                        "Կիմ Չեն Իր",
                        "Kim Xhong-Il",
                        "Jurij Irsenovič Kim",
                        "Kim Cong-il",
                        "Ким, Юрий Ирсенович",
                        "Kim Čong Il",
                        "Ким Ченир",
                        "Kim Chen Ir",
                        "Cheng-jih Chin"
                      ],
                      "position": [
                        "Supreme Leader of North Korea (1994-2011)",
                        "member of the Supreme People's Assembly",
                        "Eternal leaders of North Korea",
                        "General Secretary of the Workers' Party of Korea (1997-2011)",
                        "President of the State Affairs Commission"
                      ],
                      "birthPlace": [
                        "Vyatskoye",
                        "Ussuriysk"
                      ],
                      "weakAlias": [
                        "キム・ジョンイル"
                      ],
                      "ethnicity": [
                        "Koreans"
                      ],
                      "lastName": [
                        "Kim"
                      ],
                      "wikipediaUrl": [
                        "https://enwiki.wikipedia.org/wiki/Kim_Jong_Il"
                      ],
                      "gender": [
                        "male"
                      ],
                      "citizenship": [
                        "kp"
                      ],
                      "birthDate": [
                        "1941-02-16",
                        "1942-02-16"
                      ],
                      "education": [
                        "Mangyongdae Revolutionary School",
                        "University of Malta",
                        "Kim Il-sung University (-1964)"
                      ],
                      "political": [
                        "Workers’ Party of Korea"
                      ],
                      "religion": [
                        "atheism"
                      ],
                      "title": [
                        "Great Leader"
                      ],
                      "wikidataId": [
                        "Q10665"
                      ],
                      "deathDate": [
                        "2011-12-17"
                      ],
                      "notes": [
                        "Supreme Leader of North Korea from 1994 to 2011"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-07-18T22:03:41",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2026-03-19T01:00:15"
                  }
                ],
                "person": [
                  "Q56226"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [
                "wd-p40-q10665-q56226",
                "wd-p22-q10665-q56226"
              ],
              "target": false,
              "first_seen": "2023-07-18T22:03:41",
              "last_seen": "2026-03-19T01:00:15",
              "last_change": "2026-01-06T19:04:42"
            },
            {
              "id": "NK-gjEW3yDPXKqfTQYGin3Vhf",
              "caption": "Family",
              "schema": "Family",
              "properties": {
                "person": [
                  "Q56226"
                ],
                "relative": [
                  {
                    "id": "Q14864448",
                    "caption": "Kim Ju Ae",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "sanction.linked",
                        "role.rca"
                      ],
                      "name": [
                        "קים ג'ו-אה",
                        "Kim Ju-ae",
                        "Κιμ Τζου-ε",
                        "Կիմ Ջու Է",
                        "Ким Джу Ае",
                        "Ким Чжу Э",
                        "کیم جو ئه",
                        "Кім Джу Э",
                        "Kim Dzsue",
                        "কিম জু-আয়",
                        "Kim Džu-ae",
                        "किम जु-ए",
                        "金主愛",
                        "كيم جو أي",
                        "Kim Ču-e",
                        "Kim Ju Ae",
                        "Кім Чжу Е",
                        "김주애"
                      ],
                      "citizenship": [
                        "kp"
                      ],
                      "alias": [
                        "Kim Xhu-ae"
                      ],
                      "wikipediaUrl": [
                        "https://enwiki.wikipedia.org/wiki/Kim_Ju_Ae"
                      ],
                      "wikidataId": [
                        "Q14864448"
                      ],
                      "lastName": [
                        "Kim"
                      ],
                      "birthDate": [
                        "2013-02-19"
                      ],
                      "birthPlace": [
                        "North Korea"
                      ],
                      "gender": [
                        "female"
                      ],
                      "notes": [
                        "daughter of North Korean leader Kim Jong-un and his wife Ri Sol-ju"
                      ],
                      "weakAlias": [
                        "金朱愛",
                        "キム・ジュエ"
                      ],
                      "firstName": [
                        "Ju-ae"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-07-18T22:03:41",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2026-03-18T22:17:58"
                  }
                ],
                "relationship": [
                  "child"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [
                "wd-p22-q14864448-q56226",
                "wd-p40-q14864448-q56226"
              ],
              "target": false,
              "first_seen": "2023-07-18T22:03:41",
              "last_seen": "2026-03-19T01:00:15",
              "last_change": "2026-01-06T19:04:42"
            }
          ],
          "sanctions": [
            {
              "id": "usgsa-dfdb7a44424dbf948b081fd26c6842b03637e1bd",
              "caption": "Reciprocal",
              "schema": "Sanction",
              "properties": {
                "country": [
                  "us"
                ],
                "startDate": [
                  "2016-07-06"
                ],
                "status": [
                  "Active"
                ],
                "entity": [
                  "Q56226"
                ],
                "program": [
                  "Reciprocal"
                ],
                "sourceUrl": [
                  "https://sam.gov/data-services/Exclusions/Public%20V2?privacy=Public"
                ],
                "summary": [
                  "Redacted for Security Reasons"
                ],
                "authority": [
                  "OFAC"
                ],
                "listingDate": [
                  "2025-02-18"
                ],
                "provisions": [
                  "Prohibition/Restriction"
                ]
              },
              "datasets": [
                "crime"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-30T15:36:11",
              "last_seen": "2026-05-12T14:38:55",
              "last_change": "2026-03-30T15:36:11"
            },
            {
              "id": "ofac-9826e8b8ad44ae771182bfe4302d68e3ba937174",
              "caption": "DPRK3",
              "schema": "Sanction",
              "properties": {
                "summary": [
                  "Secondary sanctions risk: North Korea Sanctions Regulations, sections 510.201 and 510.210",
                  "Transactions Prohibited For Persons Owned or Controlled By U.S. Financial Institutions: North Korea Sanctions Regulations section 510.214"
                ],
                "authorityId": [
                  "20157"
                ],
                "sourceUrl": [
                  "https://www.treasury.gov/resource-center/sanctions/Pages/default.aspx"
                ],
                "programId": [
                  "US-NK"
                ],
                "authority": [
                  "Office of Foreign Assets Control"
                ],
                "programUrl": [
                  "https://ofac.treasury.gov/sanctions-programs-and-country-information/north-korea-sanctions"
                ],
                "provisions": [
                  "DPRK3",
                  "Block"
                ],
                "country": [
                  "us"
                ],
                "program": [
                  "DPRK3"
                ],
                "reason": [
                  "Executive Order 13722 (North Korea)"
                ],
                "entity": [
                  "Q56226"
                ]
              },
              "datasets": [
                "sanctions"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-04-20T10:27:20",
              "last_seen": "2026-05-13T06:10:01",
              "last_change": "2025-06-02T12:10:03"
            }
          ]
        },
        "datasets": [
          "core_watchlist"
        ],
        "referents": [
          "usgsa-s4mrvrpq3",
          "unprot-fb12498300bcbfba8019d11ba3dcc87e8d9e320f",
          "unprot-125bc3da6fc0f06b6ec23afc08221b2a5eead7a8",
          "unprot-720e6439b90ca1a7a8504f3a08215e7110adb231",
          "tw-shtc-1f22d6226a69d3a81acb1cb2789f479a175afe69",
          "evpo-ebbf5070-ae94-4ae9-9c7a-5645c6ce7bb0",
          "us-cia-korea-north-kim-jong-un-state-affairs-commission-president",
          "us-cia-korea-north-kim-jong-un-president-state-affairs-commission-sac",
          "ofac-20157"
        ],
        "target": true,
        "first_seen": "2019-05-21T00:00:00",
        "last_seen": "2026-03-19T12:10:01",
        "last_change": "2026-03-19T01:00:15"
      }
    },
    {
      "match_id": "M-5",
      "entity_id": "Q56226",
      "schema_type": "Person",
      "caption": "Jong Un Kim",
      "aliases": [
        "Jong Un Kim",
        "KIM, Jong Un"
      ],
      "score": 0.95,
      "risk_level": "HIGH",
      "topic_risk": 1.0,
      "primary_topic": "sanction",
      "match_features": {
        "name_match": 1.0
      },
      "topics": [
        "export.control",
        "sanction"
      ],
      "datasets": [
        "sanctions"
      ],
      "sources": [
        {
          "identifier": "sanctions",
          "title": "sanctions",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [
        "1984-01-08"
      ],
      "nationalities": [],
      "countries": [
        "kp"
      ],
      "id_numbers": [],
      "positions": [
        "Chairman of the Workers' Party of Korea"
      ],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/Q56226/",
      "status": "potential",
      "deep_dive": {
        "id": "Q56226",
        "caption": "Kim Jong-un",
        "schema": "Person",
        "properties": {
          "classification": [
            "National government (current)"
          ],
          "alias": [
            "Kim Cong un",
            "کم جونگ اُن",
            "كم جونغ أون",
            "Կիմ Ջոնգ Ուն",
            "Ким Чен Ун",
            "Kim Džiuong Un",
            "Kîm Ngit-sṳ̀n",
            "Κιμ Τζονγκ-ουν",
            "ကင်ဂျုံအွန်",
            "Ким Чжон Ун",
            "Kim Jong Eun",
            "Kim Jong-Eun",
            "किम जोङ उन",
            "Kim Jung-Woon",
            "คิม จ็อง-อึน",
            "Kim Jung Woon",
            "Ким Џонг Ун",
            "Kim Čong-un",
            "קים דשאנג און",
            "Kim Xhong-Un",
            "Kim Džongunas",
            "Kim Yong Un",
            "קים ג'ונג-און",
            "Gĭng Céng-ŏng",
            "Gim Jeong-eun",
            "கிம் ஜொங்-உன்",
            "Kim Jong Un",
            "金正恩",
            "Кім Чэн Ын",
            "Ким Ден Ын",
            "Kim Jung-eun",
            "किम जोङ्ग उन",
            "Кім Чен Ин",
            "Kim Jong-Woon",
            "ኪም ጆንግ ኡን",
            "Kim Dzsongun",
            "Jong Un Kim",
            "Kim Jong-oen",
            "كيم جونغ اون",
            "Ким Чжон Ын",
            "کیم جونق-اون",
            "კიმ ჩენ ინი",
            "Kim Çen In",
            "کیم جونگ اون",
            "کیم جونگ-اون",
            "Κιμ Γιονγκ Ουν",
            "Kims Čonins",
            "Ким Чен Ир",
            "কিম জং উন",
            "کم جونگ اون",
            "Kim Chèng-un",
            "ಕಿಮ್ ಜೋಂಗ್ ಅನ್",
            "Kim Çžon Yn",
            "Kim Chŏng-un",
            "Kim Džong-un",
            "ਕਿਮ ਜੋਂਗ ਉਨ",
            "김정은",
            "Kim Dzong Un",
            "Kim Ĝong-un",
            "കിം ജോങ് യുൻ",
            "كيم چونج اون",
            "Ким Чен Ын",
            "ຄິມ ຈອງ-ອຶນ",
            "කිම් ජොං අං",
            "Mariscal Kim Jong-un",
            "Ким Джонъын",
            "किम जोंग-उन",
            "किम जोंग उन",
            "Kim Jong Woon",
            "کیم جۆنگ ئون"
          ],
          "position": [
            "General Secretary of the Workers' Party of Korea (2012-)",
            "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
            "Supreme People’s Assembly (member, 2014-)",
            "member of the Supreme People's Assembly",
            "President of the State Affairs Commission (2012-)",
            "Supreme Commander of the Korean People’s Army (2011-)",
            "Supreme Leader of North Korea (2011-)",
            "member of the Presidium of the Politburo of the Workers' Party of Korea",
            "Chairman of the Workers' Party of Korea",
            "President, State Affairs Commission (SAC)"
          ],
          "topics": [
            "export.control",
            "sanction",
            "role.pep",
            "role.pol",
            "role.rca",
            "debarment"
          ],
          "country": [
            "kp"
          ],
          "lastName": [
            "Kim"
          ],
          "birthDate": [
            "1982-01-08",
            "1984-01-08",
            "1983-01-08"
          ],
          "firstName": [
            "Jong Un",
            "Jung-eun"
          ],
          "wikidataId": [
            "Q56226"
          ],
          "citizenship": [
            "kp"
          ],
          "name": [
            "Կիմ Ջոնգ Ուն",
            "किम जोङ उन",
            "Ким Чен Ун",
            "ကင်ဂျုံအွန်",
            "كيم جونغ أون",
            "Ким Џонг Ун",
            "Kim Čong-un",
            "KIM, Jong Un",
            "Kim Xhong-Un",
            "Kim Džongunas",
            "קים ג'ונג-און",
            "Kim Jong Un",
            "金正恩",
            "Кім Чэн Ын",
            "Кім Чен Ин",
            "Kim Dzsongun",
            "Jong Un Kim",
            "კიმ ჩენ ინი",
            "Kim Džong Un",
            "Kim Çen In",
            "کیم جونگ-اون",
            "Kims Čonins",
            "কিম জং উন",
            "Ким Чен Ир",
            "کم جونگ اون",
            "Kim Çžon Yn",
            "Kim Chŏng-un",
            "김정은",
            "Kim Dzong Un",
            "كيم چونج اون",
            "Ким Чен Ын",
            "Kim Jong-un",
            "Κιμ Γιονγκ-ουν",
            "किम जोंग उन",
            "គីម ចុងអ៊ឺន"
          ],
          "address": [
            "Korea, North"
          ],
          "title": [
            "His Excellency"
          ],
          "sourceUrl": [
            "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=20157",
            "https://www.cia.gov/resources/world-leaders/foreign-governments/korea-north"
          ],
          "programId": [
            "US-NK"
          ],
          "uniqueEntityId": [
            "RVAXCBRK2CF4"
          ],
          "createdAt": [
            "2025-02-18"
          ],
          "political": [
            "Workers’ Party of Korea"
          ],
          "weakAlias": [
            "キム・ジョンウン",
            "김정운",
            "Pak Un",
            "KJU",
            "Josef Pwag"
          ],
          "education": [
            "Liebefeld-Steinhölzli State School",
            "Kim Il-sung Military University",
            "Kim Il-sung University"
          ],
          "ethnicity": [
            "Koreans"
          ],
          "gender": [
            "male"
          ],
          "birthPlace": [
            "Changsong County",
            "Wonsan",
            "Chagang Province",
            "Samjiyon"
          ],
          "notes": [
            "Supreme Leader of North Korea since 2011"
          ],
          "wikipediaUrl": [
            "https://enwiki.wikipedia.org/wiki/Kim_Jong_Un"
          ],
          "religion": [
            "atheism"
          ],
          "positionOccupancies": [
            {
              "id": "us-cia-0c8901dcb8401a819414e13a4e25b7c879f529cc",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "NK-Gff54J9WeGZvohynbfbcG5",
                    "caption": "President, State Affairs Commission (SAC)",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "country": [
                        "kp"
                      ],
                      "name": [
                        "President, State Affairs Commission (SAC)"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "us-cia-5ae3250e80b229d72631988c90c20d6e51503cfd",
                      "us-cia-1fa55f154296125d72f31f7105e64b577d91150a"
                    ],
                    "target": false,
                    "first_seen": "2023-08-16T06:02:46",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2025-03-28T14:19:13"
                  }
                ],
                "status": [
                  "current"
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-10-11T11:06:37",
              "last_seen": "2026-05-11T21:57:21",
              "last_change": "2024-10-11T11:06:37"
            },
            {
              "id": "NK-6fA5S6A6NSD9DVa7ZQ2HPa",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "Q21328639",
                    "caption": "member of the Supreme People's Assembly",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.legislative",
                        "gov.national"
                      ],
                      "name": [
                        "Member of the Supreme People’s Assembly",
                        "member of the Supreme People's Assembly",
                        "Member of the Supreme People's Assembly"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q21328639"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "wd-9a973f096c46b3d568863b457f35fb1df292d823",
                      "evpo-d0871dd4afc460ebc7553770dd3d430058bb656e"
                    ],
                    "target": false,
                    "first_seen": "2019-05-21T00:00:00",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-db282956c1eb662a56e8e684e59289231448a20c",
                "evpo-1ed262a4866f8ac9cb96ce244f6339544eaa0916",
                "wd-58743badf27a05f8e5b457507f80af852535e7be"
              ],
              "target": false,
              "first_seen": "2019-05-21T00:00:00",
              "last_seen": "2026-05-08T13:17:18",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "wd-6e3d3adba0792644a83df6b62f64792267e90905",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q707631",
                    "caption": "General Secretary of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "inceptionDate": [
                        "2016-05-09"
                      ],
                      "name": [
                        "General Secretary of the Workers' Party of Korea"
                      ],
                      "wikidataId": [
                        "Q707631"
                      ],
                      "country": [
                        "kp"
                      ],
                      "subnationalArea": [
                        "Workers’ Party of Korea"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-16T11:27:08",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-DUfTtjRJnTZT62EQSFB2ic",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q56876342",
                    "caption": "Supreme Leader of North Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "name": [
                        "Supreme Leader of North Korea"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q56876342"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "startDate": [
                  "2011-12-17"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-7b1806dfa742826ba192e78ef79254ecea7654ac",
                "wd-cb23683d9955b19ad286790689aee08685e204ca"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-YKWfKn7pwATkyvgTfdeVJp",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "post": [
                  {
                    "id": "Q4330651",
                    "caption": "Supreme Commander of the Korean People’s Army",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.national",
                        "gov.security"
                      ],
                      "name": [
                        "Supreme Commander of the Korean People’s Army"
                      ],
                      "inceptionDate": [
                        "1948"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q4330651"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-05-17T14:17:12",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "startDate": [
                  "2011-12-17"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-aa89e6af4b156edbb20bb4b122efcbbf8313a7cb",
                "wd-e7ce76ea2b0b3e133f943a0bbf24c38169d2b361"
              ],
              "target": false,
              "first_seen": "2025-06-14T14:45:34",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "NK-YNKdDFGEm3bcK32SKEFJtn",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q56226"
                ],
                "sourceUrl": [
                  "https://nkinfo.unikorea.go.kr/nkp/theme/getPowerStructureDang.do"
                ],
                "post": [
                  {
                    "id": "Q98801004",
                    "caption": "member of the Presidium of the Politburo of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "wikidataId": [
                        "Q98801004"
                      ],
                      "name": [
                        "member of the Presidium of the Politburo of the Workers' Party of Korea"
                      ],
                      "country": [
                        "kp"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2025-05-17T12:48:05",
                    "last_seen": "2026-05-06T03:53:24",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-2835326d627ad9558fdcc2ae71078a63a8f22a90",
                "wd-3547f3c79b97fb27469a30dbc6a33975ee86d51f"
              ],
              "target": false,
              "first_seen": "2025-05-17T12:48:05",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-04-08T00:13:25"
            },
            {
              "id": "NK-jJDaRr3oF2C9qpZSR2KMky",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "startDate": [
                  "2012-04-11"
                ],
                "post": [
                  {
                    "id": "Q707631",
                    "caption": "General Secretary of the Workers' Party of Korea",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.head",
                        "gov.national"
                      ],
                      "inceptionDate": [
                        "2016-05-09"
                      ],
                      "name": [
                        "General Secretary of the Workers' Party of Korea"
                      ],
                      "wikidataId": [
                        "Q707631"
                      ],
                      "country": [
                        "kp"
                      ],
                      "subnationalArea": [
                        "Workers’ Party of Korea"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2023-09-08T07:00:40",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-13b05efde16546d867431dd6f02f5f69285ddd84",
                "wd-e9e93623a5dec3bc9cf7e46be5907e63b7602537"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            },
            {
              "id": "unprot-e296186a12331d553e50016bf0d745e66ee35511",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "unprot-97c2b5f685cac5d9c0e6f60e1ba059c1d0728a44",
                    "caption": "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea",
                    "schema": "Position",
                    "properties": {
                      "name": [
                        "General Secretary, Workers' Party of Korea, President of the State Affairs, Democratic People's Republic of Korea, Supreme Commander of Armed Forces, Democratic People's Republic of Korea"
                      ],
                      "topics": [
                        "gov.national"
                      ],
                      "country": [
                        "kp"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2026-02-15T14:12:06",
                    "last_seen": "2026-04-26T13:01:02",
                    "last_change": "2026-02-15T14:12:06"
                  }
                ],
                "status": [
                  "current"
                ],
                "startDate": [
                  "2012-03-08"
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-02-15T14:12:06",
              "last_seen": "2026-04-26T13:01:02",
              "last_change": "2026-02-15T14:12:06"
            },
            {
              "id": "wd-1964016e0b84bfc3f196a2977f35f15680a22f92",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "post": [
                  {
                    "id": "Q4330651",
                    "caption": "Supreme Commander of the Korean People’s Army",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.national",
                        "gov.security"
                      ],
                      "name": [
                        "Supreme Commander of the Korean People’s Army"
                      ],
                      "inceptionDate": [
                        "1948"
                      ],
                      "country": [
                        "kp"
                      ],
                      "wikidataId": [
                        "Q4330651"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-05-17T14:17:12",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ],
                "holder": [
                  "Q56226"
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-16T11:27:08",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            }
          ],
          "familyPerson": [
            {
              "id": "NK-9K3GFzw3BN9zxo6Y3PtBTt",
              "caption": "Family",
              "schema": "Family",
              "properties": {
                "relationship": [
                  "father"
                ],
                "relative": [
                  {
                    "id": "Q10665",
                    "caption": "Kim Jong-il",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "role.pol",
                        "mil",
                        "sanction.linked",
                        "role.rca"
                      ],
                      "name": [
                        "كيم چونج ايل",
                        "Кім Чэн Ір",
                        "Kim Dzong Il",
                        "كيم جونغ إل",
                        "کیم جونگ-ایل",
                        "Kim Džong Il",
                        "김정일",
                        "Kims Čenirs",
                        "Kim Çen İr",
                        "Kim Dzsongil",
                        "კიმ ჩენ ირი",
                        "کم جونگ ایل",
                        "金正日",
                        "Kim Jong Il",
                        "किम जोङ् इल",
                        "ಕಿಮ್ ಜೊಂಗ್",
                        "Kim Chŏng-il",
                        "Կիմ Ջոնգ Իլ",
                        "Ким Жөн Ил",
                        "কিম জং ইল",
                        "किम जोंग-इल",
                        "קים ג'ונג-איל",
                        "គីម ចុងអ៊ីល",
                        "Jong-il Kim",
                        "ကင်ဂျုံအီ",
                        "Ким Чен Ир",
                        "Kim Jong-il",
                        "Kim Čen Iras",
                        "Кім Чен Ір",
                        "Kim Čong-il",
                        "Κιμ Γιονγκ Ιλ",
                        "Ким Џонг Ил"
                      ],
                      "alias": [
                        "Chen Ir Kim",
                        "Ким Ден Ир",
                        "Yuri Irsenovich Kim",
                        "Kim Djeung Il",
                        "Čen Ir Kim",
                        "Chŏng-il Kim",
                        "Ким Чжонир",
                        "Юрий Ким",
                        "Shonichi Kin",
                        "Jong Il Kim",
                        "Amado Lider",
                        "Юрий Ирсенович Ким",
                        "Juri Irsenowitsch Kim",
                        "Ким Чжон Ир",
                        "Կիմ Չեն Իր",
                        "Kim Xhong-Il",
                        "Jurij Irsenovič Kim",
                        "Kim Cong-il",
                        "Ким, Юрий Ирсенович",
                        "Kim Čong Il",
                        "Ким Ченир",
                        "Kim Chen Ir",
                        "Cheng-jih Chin"
                      ],
                      "position": [
                        "Supreme Leader of North Korea (1994-2011)",
                        "member of the Supreme People's Assembly",
                        "Eternal leaders of North Korea",
                        "General Secretary of the Workers' Party of Korea (1997-2011)",
                        "President of the State Affairs Commission"
                      ],
                      "birthPlace": [
                        "Vyatskoye",
                        "Ussuriysk"
                      ],
                      "weakAlias": [
                        "キム・ジョンイル"
                      ],
                      "ethnicity": [
                        "Koreans"
                      ],
                      "lastName": [
                        "Kim"
                      ],
                      "wikipediaUrl": [
                        "https://enwiki.wikipedia.org/wiki/Kim_Jong_Il"
                      ],
                      "gender": [
                        "male"
                      ],
                      "citizenship": [
                        "kp"
                      ],
                      "birthDate": [
                        "1941-02-16",
                        "1942-02-16"
                      ],
                      "education": [
                        "Mangyongdae Revolutionary School",
                        "University of Malta",
                        "Kim Il-sung University (-1964)"
                      ],
                      "political": [
                        "Workers’ Party of Korea"
                      ],
                      "religion": [
                        "atheism"
                      ],
                      "title": [
                        "Great Leader"
                      ],
                      "wikidataId": [
                        "Q10665"
                      ],
                      "deathDate": [
                        "2011-12-17"
                      ],
                      "notes": [
                        "Supreme Leader of North Korea from 1994 to 2011"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-07-18T22:03:41",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2026-03-19T01:00:15"
                  }
                ],
                "person": [
                  "Q56226"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [
                "wd-p40-q10665-q56226",
                "wd-p22-q10665-q56226"
              ],
              "target": false,
              "first_seen": "2023-07-18T22:03:41",
              "last_seen": "2026-03-19T01:00:15",
              "last_change": "2026-01-06T19:04:42"
            },
            {
              "id": "NK-gjEW3yDPXKqfTQYGin3Vhf",
              "caption": "Family",
              "schema": "Family",
              "properties": {
                "person": [
                  "Q56226"
                ],
                "relative": [
                  {
                    "id": "Q14864448",
                    "caption": "Kim Ju Ae",
                    "schema": "Person",
                    "properties": {
                      "topics": [
                        "sanction.linked",
                        "role.rca"
                      ],
                      "name": [
                        "קים ג'ו-אה",
                        "Kim Ju-ae",
                        "Κιμ Τζου-ε",
                        "Կիմ Ջու Է",
                        "Ким Джу Ае",
                        "Ким Чжу Э",
                        "کیم جو ئه",
                        "Кім Джу Э",
                        "Kim Dzsue",
                        "কিম জু-আয়",
                        "Kim Džu-ae",
                        "किम जु-ए",
                        "金主愛",
                        "كيم جو أي",
                        "Kim Ču-e",
                        "Kim Ju Ae",
                        "Кім Чжу Е",
                        "김주애"
                      ],
                      "citizenship": [
                        "kp"
                      ],
                      "alias": [
                        "Kim Xhu-ae"
                      ],
                      "wikipediaUrl": [
                        "https://enwiki.wikipedia.org/wiki/Kim_Ju_Ae"
                      ],
                      "wikidataId": [
                        "Q14864448"
                      ],
                      "lastName": [
                        "Kim"
                      ],
                      "birthDate": [
                        "2013-02-19"
                      ],
                      "birthPlace": [
                        "North Korea"
                      ],
                      "gender": [
                        "female"
                      ],
                      "notes": [
                        "daughter of North Korean leader Kim Jong-un and his wife Ri Sol-ju"
                      ],
                      "weakAlias": [
                        "金朱愛",
                        "キム・ジュエ"
                      ],
                      "firstName": [
                        "Ju-ae"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2023-07-18T22:03:41",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2026-03-18T22:17:58"
                  }
                ],
                "relationship": [
                  "child"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [
                "wd-p22-q14864448-q56226",
                "wd-p40-q14864448-q56226"
              ],
              "target": false,
              "first_seen": "2023-07-18T22:03:41",
              "last_seen": "2026-03-19T01:00:15",
              "last_change": "2026-01-06T19:04:42"
            }
          ],
          "sanctions": [
            {
              "id": "usgsa-dfdb7a44424dbf948b081fd26c6842b03637e1bd",
              "caption": "Reciprocal",
              "schema": "Sanction",
              "properties": {
                "country": [
                  "us"
                ],
                "startDate": [
                  "2016-07-06"
                ],
                "status": [
                  "Active"
                ],
                "entity": [
                  "Q56226"
                ],
                "program": [
                  "Reciprocal"
                ],
                "sourceUrl": [
                  "https://sam.gov/data-services/Exclusions/Public%20V2?privacy=Public"
                ],
                "summary": [
                  "Redacted for Security Reasons"
                ],
                "authority": [
                  "OFAC"
                ],
                "listingDate": [
                  "2025-02-18"
                ],
                "provisions": [
                  "Prohibition/Restriction"
                ]
              },
              "datasets": [
                "crime"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-30T15:36:11",
              "last_seen": "2026-05-12T14:38:55",
              "last_change": "2026-03-30T15:36:11"
            },
            {
              "id": "ofac-9826e8b8ad44ae771182bfe4302d68e3ba937174",
              "caption": "DPRK3",
              "schema": "Sanction",
              "properties": {
                "summary": [
                  "Secondary sanctions risk: North Korea Sanctions Regulations, sections 510.201 and 510.210",
                  "Transactions Prohibited For Persons Owned or Controlled By U.S. Financial Institutions: North Korea Sanctions Regulations section 510.214"
                ],
                "authorityId": [
                  "20157"
                ],
                "sourceUrl": [
                  "https://www.treasury.gov/resource-center/sanctions/Pages/default.aspx"
                ],
                "programId": [
                  "US-NK"
                ],
                "authority": [
                  "Office of Foreign Assets Control"
                ],
                "programUrl": [
                  "https://ofac.treasury.gov/sanctions-programs-and-country-information/north-korea-sanctions"
                ],
                "provisions": [
                  "DPRK3",
                  "Block"
                ],
                "country": [
                  "us"
                ],
                "program": [
                  "DPRK3"
                ],
                "reason": [
                  "Executive Order 13722 (North Korea)"
                ],
                "entity": [
                  "Q56226"
                ]
              },
              "datasets": [
                "sanctions"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2023-04-20T10:27:20",
              "last_seen": "2026-05-13T06:10:01",
              "last_change": "2025-06-02T12:10:03"
            }
          ]
        },
        "datasets": [
          "core_watchlist"
        ],
        "referents": [
          "usgsa-s4mrvrpq3",
          "unprot-fb12498300bcbfba8019d11ba3dcc87e8d9e320f",
          "unprot-125bc3da6fc0f06b6ec23afc08221b2a5eead7a8",
          "unprot-720e6439b90ca1a7a8504f3a08215e7110adb231",
          "tw-shtc-1f22d6226a69d3a81acb1cb2789f479a175afe69",
          "evpo-ebbf5070-ae94-4ae9-9c7a-5645c6ce7bb0",
          "us-cia-korea-north-kim-jong-un-state-affairs-commission-president",
          "us-cia-korea-north-kim-jong-un-president-state-affairs-commission-sac",
          "ofac-20157"
        ],
        "target": true,
        "first_seen": "2019-05-21T00:00:00",
        "last_seen": "2026-03-19T12:10:01",
        "last_change": "2026-03-19T01:00:15"
      }
    }
  ]
};

export const CLEAR_EXAMPLE_RESPONSE = {
  "screening_id": "281e5503-bfd8-4171-a57b-6db4769a3fba",
  "overall_status": "clear",
  "risk_level": "LOW",
  "match_count": 0,
  "screened_at": "2026-05-14T12:43:35.336178",
  "query": {
    "name": "sdkfjhasd asdfasdf",
    "type": "individual",
    "details": {
      "name": "sdkfjhasd asdfasdf",
      "birth_date": "",
      "nationality": ""
    }
  },
  "matches": []
};

export const COMPANY_EXAMPLE_RESPONSE = {
  "screening_id": "1f738f3f-1c8b-47b4-b6e6-12be39fba2de",
  "overall_status": "alert",
  "risk_level": "HIGH",
  "match_count": 5,
  "screened_at": "2026-05-14T12:45:46.872742",
  "query": {
    "name": "Shell",
    "type": "company",
    "details": {
      "name": "Shell",
      "country": ""
    }
  },
  "matches": [
    {
      "match_id": "M-1",
      "entity_id": "NK-LMTrFEeQAQjLvZU8zn7m3V",
      "schema_type": "Company",
      "caption": "Shell",
      "aliases": [
        "Shell",
        "Shell PLC"
      ],
      "score": 0.95,
      "risk_level": "HIGH",
      "topic_risk": 0.0,
      "primary_topic": null,
      "match_features": {
        "name_match": 1.0
      },
      "topics": [],
      "datasets": [
        "core_watchlist"
      ],
      "sources": [
        {
          "identifier": "core_watchlist",
          "title": "core_watchlist",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [],
      "nationalities": [],
      "countries": [
        "gb"
      ],
      "id_numbers": [],
      "positions": [],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/NK-LMTrFEeQAQjLvZU8zn7m3V/",
      "status": "potential",
      "name": "Shell",
      "deep_dive": {
        "id": "NK-LMTrFEeQAQjLvZU8zn7m3V",
        "caption": "Shell",
        "schema": "Company",
        "properties": {
          "leiCode": [
            "21380068P1DRHMJ8KU70"
          ],
          "name": [
            "Shell",
            "Shell PLC"
          ],
          "alias": [
            "Royal Dutch Shell"
          ],
          "description": [
            "legal entity"
          ],
          "permId": [
            "4295885039"
          ],
          "mainCountry": [
            "gb"
          ],
          "legalForm": [
            "PLC"
          ],
          "address": [
            "London, City of, United Kingdom"
          ],
          "country": [
            "gb"
          ],
          "registrationNumber": [
            "04366849"
          ],
          "website": [
            "https://www.shell.com/"
          ],
          "ownershipOwner": [
            {
              "id": "gem-own-929433be152a4f544be5a9c9f565e5127347ddbd",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100002016478",
                    "caption": "Shell Energy North America (US)",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "LP"
                      ],
                      "permId": [
                        "5000417463"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "leiCode": [
                        "43Y7WACCQ8YM30PD3683"
                      ],
                      "country": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "alias": [
                        "Shell Energy North America"
                      ],
                      "name": [
                        "Shell Energy North America (US)",
                        "Shell Energy North America (US) LP"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "website": [
                        "https://www.shell.us/business/fuels-and-lubricants/lubricants-for-business/sector-expertise/power-industry.html#vanity-aHR0cHM6Ly93d3cuc2hlbGwudXMvYnVzaW5lc3MtY3VzdG9tZXJzL3NoZWxsLWVuZXJneS1ub3J0aC1hbWVyaWNhLmh0bWw"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2025-11-04T15:57:36",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.shell.com/privacy/shell-group-companies-list.html",
                  "https://www.shell.us/about-us/news-and-insights/media/2023-media-releases/shell-agrees-to-sell-ownership-stake-infrared-capital-partners.html"
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2025-11-04T15:57:36",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-edf915cc6a4e327231080bbb47af986e4b62a0df",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "14.90"
                ],
                "sourceUrl": [
                  "https://www.thappline.co.th/Company_Profile/Index/65/EN"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015883",
                    "caption": "Thai Petroleum Pipeline",
                    "schema": "Company",
                    "properties": {
                      "address": [
                        "Pathum Thani, Thailand"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "Co Ltd"
                      ],
                      "country": [
                        "th"
                      ],
                      "permId": [
                        "5000778553"
                      ],
                      "website": [
                        "https://www.thappline.co.th/"
                      ],
                      "alias": [
                        "Thappline"
                      ],
                      "name": [
                        "Thai Petroleum Pipeline",
                        "บริษัท ท่อส่งปิโตรเลียมไทย จำกัด",
                        "Thai Petroleum Pipeline Co Ltd"
                      ],
                      "mainCountry": [
                        "th"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-4b5425967b3d8292adf812b3dd870dad06266bd7",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://www.arrowenergy.com.au/about-us/our-company"
                ],
                "percentage": [
                  "50.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000002466",
                    "caption": "Arrow Energy",
                    "schema": "Company",
                    "properties": {
                      "name": [
                        "Arrow Energy Pty Ltd",
                        "Arrow Energy"
                      ],
                      "permId": [
                        "4295856343"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "Pty Ltd"
                      ],
                      "address": [
                        "Queensland, Australia"
                      ],
                      "country": [
                        "au"
                      ],
                      "mainCountry": [
                        "au"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-58765b35f8c1aae56aa45e3cb9eec10495ab240e",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100002018518",
                    "caption": "Shell Midstream Operating",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "LLC"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "country": [
                        "us"
                      ],
                      "name": [
                        "Shell Midstream Operating LLC",
                        "Shell Midstream Operating"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "permId": [
                        "5044015911"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2025-11-04T15:57:36",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "sourceUrl": [
                  "https://www.fitchratings.com/research/corporate-finance/fitch-revises-locap-llc-outlook-to-stable-affirms-idrs-at-a-f2-07-10-2022"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2025-11-04T15:57:36",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-394370be2a868ed7d7f7500642b03e05cf2c1d7d",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://jpt.spe.org/chevron-shell-finalize-argentinas-vaca-muerta-sur-pipeline-partnership"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100002007876",
                    "caption": "Vaca Muerta Oleoducto Sur",
                    "schema": "Company",
                    "properties": {
                      "name": [
                        "Vaca Muerta Oleoducto Sur",
                        "Vaca Muerta Oleoducto Sur SA"
                      ],
                      "legalForm": [
                        "SA"
                      ],
                      "mainCountry": [
                        "ar"
                      ],
                      "country": [
                        "ar"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "Argentina"
                      ],
                      "weakAlias": [
                        "VMOS"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "13.80"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-42d15c6461796f8689e499c1152dbc943c366225",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://reports.shell.com/annual-report/2023/_assets/downloads/shell-annual-report-2023.pdf"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "NK-k5TYSc9cbfWvVebSFbuT8c",
                    "caption": "Shell USA",
                    "schema": "Company",
                    "properties": {
                      "description": [
                        "legal entity"
                      ],
                      "name": [
                        "Shell USA Inc",
                        "Shell USA"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "country": [
                        "us"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "legalForm": [
                        "Inc"
                      ],
                      "leiCode": [
                        "549300UYFI41EIQ10304"
                      ],
                      "permId": [
                        "4296316676"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "gem-own-e100001014102",
                      "lei-549300UYFI41EIQ10304"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-f1f87008008f56974956be91d21cc5eff6148a02",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001014209",
                    "caption": "Karachaganak Petroleum Operating",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "address": [
                        "Netherlands"
                      ],
                      "legalForm": [
                        "BV"
                      ],
                      "name": [
                        "Karachaganak Petroleum Operating BV",
                        "Karachaganak Petroleum Operating"
                      ],
                      "country": [
                        "nl"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "website": [
                        "https://www.kpo.kz/"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "permId": [
                        "4298330159"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "29.20"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.kpo.kz/en/about-kpo/parent-companies"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-557347295bf64bf0b0b54197365f3808a4e589f2",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf",
                  "https://reports.shell.com/annual-report/2023/_assets/downloads/shell-annual-report-2023.pdf"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015580",
                    "caption": "Shell Australia",
                    "schema": "Company",
                    "properties": {
                      "address": [
                        "Western Australia, Australia"
                      ],
                      "permId": [
                        "4298363412"
                      ],
                      "legalForm": [
                        "Pty Ltd"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "name": [
                        "Shell Australia Pty Ltd",
                        "Shell Australia"
                      ],
                      "mainCountry": [
                        "au"
                      ],
                      "country": [
                        "au"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-01fea652ab3870a7c60162f9ac8055adfa79013e",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "50.00"
                ],
                "sourceUrl": [
                  "https://www.bnamericas.com/en/company-profile/andes-sa-andes-lng"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001010976",
                    "caption": "Andes",
                    "schema": "Company",
                    "properties": {
                      "address": [
                        "Chile"
                      ],
                      "country": [
                        "cl"
                      ],
                      "name": [
                        "Andes",
                        "Andes SA"
                      ],
                      "alias": [
                        "Andes LNG"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "SA"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-c77b6b6d240e7c27ee66eb77d6098fa6b1b84bb2",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001015944",
                    "caption": "Transalpine Pipeline Group",
                    "schema": "LegalEntity",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "name": [
                        "Transalpine Pipeline Group"
                      ],
                      "description": [
                        "arrangement"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-07-21T12:45:21"
                  }
                ],
                "sourceUrl": [
                  "https://web.archive.org/web/20220410125045/https://www.tal-oil.com/en/tal-group/company-profile"
                ],
                "percentage": [
                  "14.30"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-47022c1e5c572d1257f99bf12e4cc64b7f8ad0c8",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://reports.shell.com/annual-report/2020/servicepages/downloads/files/shell-annual-report-2020.pdf"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000004172",
                    "caption": "Tejas Power Generation",
                    "schema": "Company",
                    "properties": {
                      "permId": [
                        "5053128566"
                      ],
                      "name": [
                        "Tejas Power Generation LLC",
                        "Tejas Power Generation"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "country": [
                        "us"
                      ],
                      "legalForm": [
                        "LLC"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-73e65cc35c1589a1cc868bf86f610ccb98f9ea71",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001010525",
                    "caption": "QGC Sales QLD",
                    "schema": "Company",
                    "properties": {
                      "name": [
                        "QGC Sales QLD",
                        "QGC Sales QLD Pty Ltd"
                      ],
                      "mainCountry": [
                        "au"
                      ],
                      "legalForm": [
                        "Pty Ltd"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "au"
                      ],
                      "permId": [
                        "5044615134"
                      ],
                      "address": [
                        "Queensland, Australia"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.sec.gov/Archives/edgar/data/1306965/000156459019007740/rdsa-ex81_6.htm"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-c7c32e098e240c8e6d3bc9172a6b969f8283eae8",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001014673",
                    "caption": "Endymion Oil Pipeline Company",
                    "schema": "Company",
                    "properties": {
                      "country": [
                        "us"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "permId": [
                        "5052789727"
                      ],
                      "name": [
                        "Endymion Oil Pipeline Company LLC",
                        "Endymion Oil Pipeline Company"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "legalForm": [
                        "LLC"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "10.00"
                ],
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2025-11-04T15:57:36",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-1004ce9ef64692cf53d070880fecee8cb0c40d90",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "56.00"
                ],
                "sourceUrl": [
                  "https://shell.gcs-web.com/static-files/e7471f79-a49c-4a8f-840e-9710fbcc6159",
                  "https://rrp.nl/over-rrp/"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015413",
                    "caption": "Rotterdam-Rijn Pijpleiding Maatschappij",
                    "schema": "Company",
                    "properties": {
                      "weakAlias": [
                        "RRP"
                      ],
                      "name": [
                        "Rotterdam-Rijn Pijpleiding Maatschappij",
                        "Rotterdam-Rijn Pijpleiding Maatschappij NV"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "NV"
                      ],
                      "alias": [
                        "NV Rotterdam-Rijn Pijpleiding Maatschappij"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "country": [
                        "nl"
                      ],
                      "address": [
                        "Zuid-Holland, Netherlands"
                      ],
                      "permId": [
                        "5001346782"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-1e0da5b4e473a56ed19be7527bcd056cfcf1b9a7",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.offshore-mag.com/business-briefs/company-news/article/55127354/tenaz-strikes-deal-with-shell-exxonmobil-for-nam-offshore",
                  "https://reports.shell.com/annual-report/2023/_assets/downloads/shell-annual-report-2023.pdf"
                ],
                "percentage": [
                  "50.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100002005108",
                    "caption": "Nederlandse Aardolie Maatschappij",
                    "schema": "Company",
                    "properties": {
                      "country": [
                        "nl"
                      ],
                      "name": [
                        "Nederlandse Aardolie Maatschappij",
                        "Nederlandse Aardolie Maatschappij BV"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "legalForm": [
                        "BV"
                      ],
                      "weakAlias": [
                        "NAM"
                      ],
                      "address": [
                        "Drenthe, Netherlands"
                      ],
                      "website": [
                        "https://www.nam.nl/"
                      ],
                      "leiCode": [
                        "2138004JQD1KA2GSC430"
                      ],
                      "permId": [
                        "4296716142"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2026-02-04T20:01:12",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2026-02-04T20:01:12"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-02-04T20:01:12",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-7dc9f39a629e51e2b776ca1614eff14c891ed60d",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "NK-JtTiKVn7SeKKwWMs49qqFz",
                    "caption": "Petroleum Development Oman",
                    "schema": "Company",
                    "properties": {
                      "mainCountry": [
                        "om"
                      ],
                      "permId": [
                        "5000470136"
                      ],
                      "weakAlias": [
                        "PDO"
                      ],
                      "address": [
                        "Masqaţ, Oman"
                      ],
                      "name": [
                        "Petroleum Development Oman LLC",
                        "Petroleum Development Oman",
                        "شركة تنمية نفط عُمان"
                      ],
                      "leiCode": [
                        "254900LMNZ7EZCGH0D78"
                      ],
                      "country": [
                        "om"
                      ],
                      "legalForm": [
                        "LLC"
                      ],
                      "website": [
                        "https://www.pdo.co.om/"
                      ],
                      "description": [
                        "legal entity"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "lei-254900LMNZ7EZCGH0D78",
                      "gem-own-e100000003810"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "34.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.pdo.co.om/en/Pages/WhoWeAre/PDO-AT-A-Glance.aspx"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-5c82e51a9864763f0f37b4495219c679a45b48a4",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001015612",
                    "caption": "Shell Pipeline Company",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "LP"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "name": [
                        "Shell Pipeline Company",
                        "Shell Pipeline Company LP"
                      ],
                      "country": [
                        "us"
                      ],
                      "alias": [
                        "Shell Pipeline Co LP"
                      ],
                      "permId": [
                        "4296592104"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "100.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2025-11-04T15:57:36",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-94b801af987654b570d1a24470b795b8b58e31bd",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.shell.com.ng/about-us/what-we-do/nlng.html",
                  "https://constructionreviewonline.com/news/nigeria/construction-of-nlngs-7th-train-at-bonny-island-to-commence-in-2024/"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000003649",
                    "caption": "Nigeria LNG",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "website": [
                        "https://www.nlng.com/"
                      ],
                      "legalForm": [
                        "Ltd"
                      ],
                      "name": [
                        "Nigeria LNG Ltd",
                        "Nigeria LNG"
                      ],
                      "permId": [
                        "5000722697"
                      ],
                      "mainCountry": [
                        "ng"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "Rivers, Nigeria"
                      ],
                      "country": [
                        "ng"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "25.60"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-bfb1c3e563da1f5a5c360157b4a5cd02b7adb9a4",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://reports.shell.com/annual-report/2023/_assets/downloads/shell-annual-report-2023.pdf",
                  "https://www.shell.no/"
                ],
                "asset": [
                  {
                    "id": "NK-W2nEHkWthAk5fwFpSExRzA",
                    "caption": "Norske Shell",
                    "schema": "Company",
                    "properties": {
                      "mainCountry": [
                        "no"
                      ],
                      "address": [
                        "Rogaland, Norway"
                      ],
                      "country": [
                        "no"
                      ],
                      "alias": [
                        "A/S Norske Shell"
                      ],
                      "name": [
                        "Norske Shell A/S",
                        "Norske Shell"
                      ],
                      "website": [
                        "https://www.shell.no/"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "permId": [
                        "4295885635"
                      ],
                      "legalForm": [
                        "A/S"
                      ],
                      "leiCode": [
                        "213800F4ETX85XLF5K47"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "gem-own-e100001013986",
                      "oc-companies-gb-oe026447",
                      "lei-213800F4ETX85XLF5K47"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-bd11e47d8d302e3ad4f5ab0110f9c9e985a0c2cd",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000002875",
                    "caption": "Shell Energy Operations",
                    "schema": "Company",
                    "properties": {
                      "leiCode": [
                        "529900GV6QOT0U2ZAZ38"
                      ],
                      "address": [
                        "Queensland, Australia"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "weakAlias": [
                        "Shell Energy"
                      ],
                      "mainCountry": [
                        "au"
                      ],
                      "legalForm": [
                        "Pty Ltd"
                      ],
                      "permId": [
                        "5001214386"
                      ],
                      "name": [
                        "Shell Energy Operations Pty Ltd",
                        "Shell Energy Operations"
                      ],
                      "alias": [
                        "ERM Power"
                      ],
                      "country": [
                        "au"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "sourceUrl": [
                  "https://ermpower.com.au/about-erm/our-story/",
                  "https://www.shell.com/privacy/shell-group-companies-list.html"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-9fa894a63678791db013102950cf302723f64695",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "46.10"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015211",
                    "caption": "LOOP",
                    "schema": "Company",
                    "properties": {
                      "mainCountry": [
                        "us"
                      ],
                      "permId": [
                        "4297932915"
                      ],
                      "legalForm": [
                        "LLC"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "name": [
                        "LOOP LLC",
                        "LOOP"
                      ],
                      "address": [
                        "Louisiana, Delaware, United States"
                      ],
                      "country": [
                        "us"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "sourceUrl": [
                  "https://www.fitchratings.com/research/corporate-finance/fitch-affirms-loop-llc-at-bbb-outlook-stable-07-10-2022"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-3603aef2648ccff28291f250e643b3f727adbb97",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://search.gleif.org/"
                ],
                "asset": [
                  {
                    "id": "NK-XuJ5JRJfMntcrpkUBjs9u5",
                    "caption": "Shell Nederland Raffinaderij",
                    "schema": "Company",
                    "properties": {
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "nl"
                      ],
                      "name": [
                        "Shell Nederland Raffinaderij"
                      ],
                      "address": [
                        "Zuid-Holland, Netherlands"
                      ],
                      "leiCode": [
                        "2138009FAB375EZDNU25"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "permId": [
                        "4298332901"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "gem-own-e100000001665",
                      "lei-2138009FAB375EZDNU25"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-62b213a4df10029a77497030873b4fa2aa98214f",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.spse.fr/en/about-us-network-management-shareholders.php"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015713",
                    "caption": "Société du Pipeline Sud-Européen SA",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "mainCountry": [
                        "fr"
                      ],
                      "website": [
                        "https://www.spse.fr/"
                      ],
                      "permId": [
                        "5000972303"
                      ],
                      "address": [
                        "France"
                      ],
                      "legalForm": [
                        "SA"
                      ],
                      "alias": [
                        "SOCIETE DU PIPELINE SUD-EUROPEEN"
                      ],
                      "country": [
                        "fr"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "name": [
                        "Société du Pipeline Sud-Européen SA",
                        "Société du Pipeline Sud-Européen"
                      ],
                      "weakAlias": [
                        "SPSE"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-07-21T12:45:21"
                  }
                ],
                "percentage": [
                  "13.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-80a950f66177b2f80d55e7dec62963068741db08",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://power.mhi.com/regions/amer/news/200107.html",
                  "https://valorinternational.globo.com/business/news/2025/01/10/shell-mitsubishi-power-reportedly-hire-itau-bba-for-marlim-azul-sale.ghtml"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000003539",
                    "caption": "Arke Energia",
                    "schema": "Company",
                    "properties": {
                      "alias": [
                        "Marlim Azul Energia"
                      ],
                      "mainCountry": [
                        "br"
                      ],
                      "name": [
                        "Arke Energia SA",
                        "Arke Energia"
                      ],
                      "address": [
                        "São Paulo -, Brazil"
                      ],
                      "legalForm": [
                        "SA"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "br"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "29.90"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-73017c1ecf0544339daf7054cf9d647c580ad83e",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001015993",
                    "caption": "Rosneft-Shell Caspian Ventures",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "permId": [
                        "5035713174"
                      ],
                      "website": [
                        "https://rosneft-shellcaspian.com/"
                      ],
                      "address": [
                        "Cyprus"
                      ],
                      "name": [
                        "Rosneft-Shell Caspian Ventures",
                        "Rosneft-Shell Caspian Ventures Ltd"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "Ltd"
                      ],
                      "mainCountry": [
                        "cy"
                      ],
                      "country": [
                        "cy"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "sourceUrl": [
                  "https://www.power3point0.org/2022/07/20/sanctioning-pipelines-and-oligarchs-is-not-a-silver-bullet-to-stop-putins-war-in-ukraine/"
                ],
                "percentage": [
                  "49.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-5c8f32518e2e49fb5e70f1c12319d739cea0de0d",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100002004819",
                    "caption": "Shell Gas",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "BV"
                      ],
                      "name": [
                        "Shell Gas",
                        "Shell Gas BV"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "address": [
                        "Zuid-Holland, Netherlands"
                      ],
                      "permId": [
                        "5036879644"
                      ],
                      "country": [
                        "nl"
                      ],
                      "description": [
                        "legal entity"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-bdb3b6d53a4877467536d6c76b21dce994df7956",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "NK-GWCukmmeQL296EDZcyXkJi",
                    "caption": "Shell Deutschland",
                    "schema": "Company",
                    "properties": {
                      "country": [
                        "de"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "mainCountry": [
                        "de"
                      ],
                      "leiCode": [
                        "213800VBMNEKDCASIO50"
                      ],
                      "legalForm": [
                        "GmbH"
                      ],
                      "name": [
                        "Shell Deutschland GmbH",
                        "Shell Deutschland"
                      ],
                      "permId": [
                        "4297177127"
                      ],
                      "address": [
                        "Hamburg, Germany"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "lei-213800VBMNEKDCASIO50",
                      "gem-own-e100000004022"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "sourceUrl": [
                  "https://search.gleif.org/#/record/213800VBMNEKDCASIO50"
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-6277314f9e9da538545aee20c1e1d7edb1dfa578",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "NK-UdUY2UCPG69U89TwmKWUHq",
                    "caption": "Shell Group Holding",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "Ltd"
                      ],
                      "mainCountry": [
                        "gb"
                      ],
                      "name": [
                        "Shell Group Holding",
                        "Shell Group Holding Ltd"
                      ],
                      "leiCode": [
                        "2138001GYK62SDP6CH49"
                      ],
                      "permId": [
                        "5086897880"
                      ],
                      "registrationNumber": [
                        "14865121"
                      ],
                      "country": [
                        "gb"
                      ],
                      "address": [
                        "London, City of, United Kingdom"
                      ],
                      "description": [
                        "legal entity"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "gb-coh-psc-12251164-khazqx7-ehtd3u8jdis72yr2vbq",
                      "gem-own-e100002001367",
                      "lei-2138001GYK62SDP6CH49"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "100.00"
                ],
                "sourceUrl": [
                  "https://www.gov.uk/get-information-about-a-company"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-19863f48518dc3adb21b35ceaac53620e3dd8d46",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://www.power3point0.org/2022/07/20/sanctioning-pipelines-and-oligarchs-is-not-a-silver-bullet-to-stop-putins-war-in-ukraine/",
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section_2113846431/link_list/links/item5.stream/1742873105897/80dd2a0664db6dc6ac1c376e9425ec9321fb9740/additional-information-ar24.pdf",
                  "https://www.cpc.ru/en/operations/Pages/shippers.aspx"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "100.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015661",
                    "caption": "Oryx Caspian Pipeline",
                    "schema": "Company",
                    "properties": {
                      "name": [
                        "Oryx Caspian Pipeline",
                        "Oryx Caspian Pipeline LLC"
                      ],
                      "legalForm": [
                        "LLC"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "us"
                      ],
                      "address": [
                        "Delaware, Delaware, United States"
                      ],
                      "permId": [
                        "5053129367"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-47668da0ff0af61bc303991e3a94742b9caab276",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000004021",
                    "caption": "Shell Chemical Appalachia",
                    "schema": "Company",
                    "properties": {
                      "permId": [
                        "5053128283"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "United States"
                      ],
                      "legalForm": [
                        "LLC"
                      ],
                      "name": [
                        "Shell Chemical Appalachia LLC",
                        "Shell Chemical Appalachia"
                      ],
                      "country": [
                        "us"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-61558bc859e0263375d19025e38136a0e5368593",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "16.80"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000003659",
                    "caption": "North Caspian Operating Company NV",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "legalForm": [
                        "NV"
                      ],
                      "permId": [
                        "5035466438"
                      ],
                      "address": [
                        "Kazakhstan, Atyraū oblysy"
                      ],
                      "alias": [
                        "BRANCH OF \"NORT KASPIAN OPEREJTING KOMPANI N.V.\"",
                        "North Caspian Operating Company NV (Atyrau Branch)",
                        "ФИЛИАЛ \"НОРТ КАСПИАН ОПЕРЕЙТИНГ КОМПАНИ Н.В.\""
                      ],
                      "mainCountry": [
                        "kz"
                      ],
                      "website": [
                        "https://www.ncoc.kz/"
                      ],
                      "weakAlias": [
                        "NCOC"
                      ],
                      "name": [
                        "North Caspian Operating Company",
                        "\"НОРТ КАСПИАН ОПЕРЕЙТИНГ КОМПАНИ Н.В.\" ФИЛИАЛ",
                        "North Caspian Operating Company NV"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "kz"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.ncoc.kz/kk/page/our-management"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            }
          ],
          "securities": [
            {
              "id": "isin-GB00BP6MXD84",
              "caption": "Shell Plc",
              "schema": "Security",
              "properties": {
                "name": [
                  "Shell Plc"
                ],
                "country": [
                  "gb"
                ],
                "topics": [
                  "reg.warn"
                ],
                "issuer": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "programId": [
                  "EU-ESMA"
                ],
                "isin": [
                  "GB00BP6MXD84"
                ]
              },
              "datasets": [
                "sanctions"
              ],
              "referents": [],
              "target": true,
              "first_seen": "2024-07-17T19:07:02",
              "last_seen": "2026-05-12T19:07:01",
              "last_change": "2025-09-12T19:07:02"
            }
          ]
        },
        "datasets": [
          "core_watchlist"
        ],
        "referents": [
          "gb-coh-psc-OE026447-guzyy53r5aevkbs0e1jux3y2wda",
          "oc-companies-gb-04366849",
          "lei-21380068P1DRHMJ8KU70",
          "gem-own-e100000000746"
        ],
        "target": false,
        "first_seen": "2024-06-30T00:00:00",
        "last_seen": "2026-03-18T19:07:01",
        "last_change": "2026-02-04T20:01:12"
      }
    },
    {
      "match_id": "M-2",
      "entity_id": "NK-LMTrFEeQAQjLvZU8zn7m3V",
      "schema_type": "LegalEntity",
      "caption": "SHELL PLC",
      "aliases": [
        "SHELL PLC"
      ],
      "score": 0.8333,
      "risk_level": "MEDIUM",
      "topic_risk": 0.0,
      "primary_topic": null,
      "match_features": {
        "name_match": 0.8771929824561404
      },
      "topics": [],
      "datasets": [
        "sanctions"
      ],
      "sources": [
        {
          "identifier": "sanctions",
          "title": "sanctions",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [],
      "nationalities": [],
      "countries": [],
      "id_numbers": [],
      "positions": [],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/NK-LMTrFEeQAQjLvZU8zn7m3V/",
      "status": "potential",
      "name": "SHELL PLC",
      "deep_dive": {
        "id": "NK-LMTrFEeQAQjLvZU8zn7m3V",
        "caption": "Shell",
        "schema": "Company",
        "properties": {
          "leiCode": [
            "21380068P1DRHMJ8KU70"
          ],
          "name": [
            "Shell",
            "Shell PLC"
          ],
          "alias": [
            "Royal Dutch Shell"
          ],
          "description": [
            "legal entity"
          ],
          "permId": [
            "4295885039"
          ],
          "mainCountry": [
            "gb"
          ],
          "legalForm": [
            "PLC"
          ],
          "address": [
            "London, City of, United Kingdom"
          ],
          "country": [
            "gb"
          ],
          "registrationNumber": [
            "04366849"
          ],
          "website": [
            "https://www.shell.com/"
          ],
          "ownershipOwner": [
            {
              "id": "gem-own-929433be152a4f544be5a9c9f565e5127347ddbd",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100002016478",
                    "caption": "Shell Energy North America (US)",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "LP"
                      ],
                      "permId": [
                        "5000417463"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "leiCode": [
                        "43Y7WACCQ8YM30PD3683"
                      ],
                      "country": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "alias": [
                        "Shell Energy North America"
                      ],
                      "name": [
                        "Shell Energy North America (US)",
                        "Shell Energy North America (US) LP"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "website": [
                        "https://www.shell.us/business/fuels-and-lubricants/lubricants-for-business/sector-expertise/power-industry.html#vanity-aHR0cHM6Ly93d3cuc2hlbGwudXMvYnVzaW5lc3MtY3VzdG9tZXJzL3NoZWxsLWVuZXJneS1ub3J0aC1hbWVyaWNhLmh0bWw"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2025-11-04T15:57:36",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.shell.com/privacy/shell-group-companies-list.html",
                  "https://www.shell.us/about-us/news-and-insights/media/2023-media-releases/shell-agrees-to-sell-ownership-stake-infrared-capital-partners.html"
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2025-11-04T15:57:36",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-edf915cc6a4e327231080bbb47af986e4b62a0df",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "14.90"
                ],
                "sourceUrl": [
                  "https://www.thappline.co.th/Company_Profile/Index/65/EN"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015883",
                    "caption": "Thai Petroleum Pipeline",
                    "schema": "Company",
                    "properties": {
                      "address": [
                        "Pathum Thani, Thailand"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "Co Ltd"
                      ],
                      "country": [
                        "th"
                      ],
                      "permId": [
                        "5000778553"
                      ],
                      "website": [
                        "https://www.thappline.co.th/"
                      ],
                      "alias": [
                        "Thappline"
                      ],
                      "name": [
                        "Thai Petroleum Pipeline",
                        "บริษัท ท่อส่งปิโตรเลียมไทย จำกัด",
                        "Thai Petroleum Pipeline Co Ltd"
                      ],
                      "mainCountry": [
                        "th"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-4b5425967b3d8292adf812b3dd870dad06266bd7",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://www.arrowenergy.com.au/about-us/our-company"
                ],
                "percentage": [
                  "50.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000002466",
                    "caption": "Arrow Energy",
                    "schema": "Company",
                    "properties": {
                      "name": [
                        "Arrow Energy Pty Ltd",
                        "Arrow Energy"
                      ],
                      "permId": [
                        "4295856343"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "Pty Ltd"
                      ],
                      "address": [
                        "Queensland, Australia"
                      ],
                      "country": [
                        "au"
                      ],
                      "mainCountry": [
                        "au"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-58765b35f8c1aae56aa45e3cb9eec10495ab240e",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100002018518",
                    "caption": "Shell Midstream Operating",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "LLC"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "country": [
                        "us"
                      ],
                      "name": [
                        "Shell Midstream Operating LLC",
                        "Shell Midstream Operating"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "permId": [
                        "5044015911"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2025-11-04T15:57:36",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "sourceUrl": [
                  "https://www.fitchratings.com/research/corporate-finance/fitch-revises-locap-llc-outlook-to-stable-affirms-idrs-at-a-f2-07-10-2022"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2025-11-04T15:57:36",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-394370be2a868ed7d7f7500642b03e05cf2c1d7d",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://jpt.spe.org/chevron-shell-finalize-argentinas-vaca-muerta-sur-pipeline-partnership"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100002007876",
                    "caption": "Vaca Muerta Oleoducto Sur",
                    "schema": "Company",
                    "properties": {
                      "name": [
                        "Vaca Muerta Oleoducto Sur",
                        "Vaca Muerta Oleoducto Sur SA"
                      ],
                      "legalForm": [
                        "SA"
                      ],
                      "mainCountry": [
                        "ar"
                      ],
                      "country": [
                        "ar"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "Argentina"
                      ],
                      "weakAlias": [
                        "VMOS"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "13.80"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-42d15c6461796f8689e499c1152dbc943c366225",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://reports.shell.com/annual-report/2023/_assets/downloads/shell-annual-report-2023.pdf"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "NK-k5TYSc9cbfWvVebSFbuT8c",
                    "caption": "Shell USA",
                    "schema": "Company",
                    "properties": {
                      "description": [
                        "legal entity"
                      ],
                      "name": [
                        "Shell USA Inc",
                        "Shell USA"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "country": [
                        "us"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "legalForm": [
                        "Inc"
                      ],
                      "leiCode": [
                        "549300UYFI41EIQ10304"
                      ],
                      "permId": [
                        "4296316676"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "gem-own-e100001014102",
                      "lei-549300UYFI41EIQ10304"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-f1f87008008f56974956be91d21cc5eff6148a02",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001014209",
                    "caption": "Karachaganak Petroleum Operating",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "address": [
                        "Netherlands"
                      ],
                      "legalForm": [
                        "BV"
                      ],
                      "name": [
                        "Karachaganak Petroleum Operating BV",
                        "Karachaganak Petroleum Operating"
                      ],
                      "country": [
                        "nl"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "website": [
                        "https://www.kpo.kz/"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "permId": [
                        "4298330159"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "29.20"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.kpo.kz/en/about-kpo/parent-companies"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-557347295bf64bf0b0b54197365f3808a4e589f2",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf",
                  "https://reports.shell.com/annual-report/2023/_assets/downloads/shell-annual-report-2023.pdf"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015580",
                    "caption": "Shell Australia",
                    "schema": "Company",
                    "properties": {
                      "address": [
                        "Western Australia, Australia"
                      ],
                      "permId": [
                        "4298363412"
                      ],
                      "legalForm": [
                        "Pty Ltd"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "name": [
                        "Shell Australia Pty Ltd",
                        "Shell Australia"
                      ],
                      "mainCountry": [
                        "au"
                      ],
                      "country": [
                        "au"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-01fea652ab3870a7c60162f9ac8055adfa79013e",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "50.00"
                ],
                "sourceUrl": [
                  "https://www.bnamericas.com/en/company-profile/andes-sa-andes-lng"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001010976",
                    "caption": "Andes",
                    "schema": "Company",
                    "properties": {
                      "address": [
                        "Chile"
                      ],
                      "country": [
                        "cl"
                      ],
                      "name": [
                        "Andes",
                        "Andes SA"
                      ],
                      "alias": [
                        "Andes LNG"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "SA"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-c77b6b6d240e7c27ee66eb77d6098fa6b1b84bb2",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001015944",
                    "caption": "Transalpine Pipeline Group",
                    "schema": "LegalEntity",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "name": [
                        "Transalpine Pipeline Group"
                      ],
                      "description": [
                        "arrangement"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-07-21T12:45:21"
                  }
                ],
                "sourceUrl": [
                  "https://web.archive.org/web/20220410125045/https://www.tal-oil.com/en/tal-group/company-profile"
                ],
                "percentage": [
                  "14.30"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-47022c1e5c572d1257f99bf12e4cc64b7f8ad0c8",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://reports.shell.com/annual-report/2020/servicepages/downloads/files/shell-annual-report-2020.pdf"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000004172",
                    "caption": "Tejas Power Generation",
                    "schema": "Company",
                    "properties": {
                      "permId": [
                        "5053128566"
                      ],
                      "name": [
                        "Tejas Power Generation LLC",
                        "Tejas Power Generation"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "country": [
                        "us"
                      ],
                      "legalForm": [
                        "LLC"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-73e65cc35c1589a1cc868bf86f610ccb98f9ea71",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001010525",
                    "caption": "QGC Sales QLD",
                    "schema": "Company",
                    "properties": {
                      "name": [
                        "QGC Sales QLD",
                        "QGC Sales QLD Pty Ltd"
                      ],
                      "mainCountry": [
                        "au"
                      ],
                      "legalForm": [
                        "Pty Ltd"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "au"
                      ],
                      "permId": [
                        "5044615134"
                      ],
                      "address": [
                        "Queensland, Australia"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.sec.gov/Archives/edgar/data/1306965/000156459019007740/rdsa-ex81_6.htm"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-c7c32e098e240c8e6d3bc9172a6b969f8283eae8",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001014673",
                    "caption": "Endymion Oil Pipeline Company",
                    "schema": "Company",
                    "properties": {
                      "country": [
                        "us"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "permId": [
                        "5052789727"
                      ],
                      "name": [
                        "Endymion Oil Pipeline Company LLC",
                        "Endymion Oil Pipeline Company"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "legalForm": [
                        "LLC"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "10.00"
                ],
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2025-11-04T15:57:36",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-1004ce9ef64692cf53d070880fecee8cb0c40d90",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "56.00"
                ],
                "sourceUrl": [
                  "https://shell.gcs-web.com/static-files/e7471f79-a49c-4a8f-840e-9710fbcc6159",
                  "https://rrp.nl/over-rrp/"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015413",
                    "caption": "Rotterdam-Rijn Pijpleiding Maatschappij",
                    "schema": "Company",
                    "properties": {
                      "weakAlias": [
                        "RRP"
                      ],
                      "name": [
                        "Rotterdam-Rijn Pijpleiding Maatschappij",
                        "Rotterdam-Rijn Pijpleiding Maatschappij NV"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "NV"
                      ],
                      "alias": [
                        "NV Rotterdam-Rijn Pijpleiding Maatschappij"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "country": [
                        "nl"
                      ],
                      "address": [
                        "Zuid-Holland, Netherlands"
                      ],
                      "permId": [
                        "5001346782"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-1e0da5b4e473a56ed19be7527bcd056cfcf1b9a7",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.offshore-mag.com/business-briefs/company-news/article/55127354/tenaz-strikes-deal-with-shell-exxonmobil-for-nam-offshore",
                  "https://reports.shell.com/annual-report/2023/_assets/downloads/shell-annual-report-2023.pdf"
                ],
                "percentage": [
                  "50.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100002005108",
                    "caption": "Nederlandse Aardolie Maatschappij",
                    "schema": "Company",
                    "properties": {
                      "country": [
                        "nl"
                      ],
                      "name": [
                        "Nederlandse Aardolie Maatschappij",
                        "Nederlandse Aardolie Maatschappij BV"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "legalForm": [
                        "BV"
                      ],
                      "weakAlias": [
                        "NAM"
                      ],
                      "address": [
                        "Drenthe, Netherlands"
                      ],
                      "website": [
                        "https://www.nam.nl/"
                      ],
                      "leiCode": [
                        "2138004JQD1KA2GSC430"
                      ],
                      "permId": [
                        "4296716142"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2026-02-04T20:01:12",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2026-02-04T20:01:12"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-02-04T20:01:12",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-7dc9f39a629e51e2b776ca1614eff14c891ed60d",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "NK-JtTiKVn7SeKKwWMs49qqFz",
                    "caption": "Petroleum Development Oman",
                    "schema": "Company",
                    "properties": {
                      "mainCountry": [
                        "om"
                      ],
                      "permId": [
                        "5000470136"
                      ],
                      "weakAlias": [
                        "PDO"
                      ],
                      "address": [
                        "Masqaţ, Oman"
                      ],
                      "name": [
                        "Petroleum Development Oman LLC",
                        "Petroleum Development Oman",
                        "شركة تنمية نفط عُمان"
                      ],
                      "leiCode": [
                        "254900LMNZ7EZCGH0D78"
                      ],
                      "country": [
                        "om"
                      ],
                      "legalForm": [
                        "LLC"
                      ],
                      "website": [
                        "https://www.pdo.co.om/"
                      ],
                      "description": [
                        "legal entity"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "lei-254900LMNZ7EZCGH0D78",
                      "gem-own-e100000003810"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "34.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.pdo.co.om/en/Pages/WhoWeAre/PDO-AT-A-Glance.aspx"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-5c82e51a9864763f0f37b4495219c679a45b48a4",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001015612",
                    "caption": "Shell Pipeline Company",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "LP"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "Texas, Delaware, United States"
                      ],
                      "name": [
                        "Shell Pipeline Company",
                        "Shell Pipeline Company LP"
                      ],
                      "country": [
                        "us"
                      ],
                      "alias": [
                        "Shell Pipeline Co LP"
                      ],
                      "permId": [
                        "4296592104"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "100.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2025-11-04T15:57:36",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-94b801af987654b570d1a24470b795b8b58e31bd",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.shell.com.ng/about-us/what-we-do/nlng.html",
                  "https://constructionreviewonline.com/news/nigeria/construction-of-nlngs-7th-train-at-bonny-island-to-commence-in-2024/"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000003649",
                    "caption": "Nigeria LNG",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "website": [
                        "https://www.nlng.com/"
                      ],
                      "legalForm": [
                        "Ltd"
                      ],
                      "name": [
                        "Nigeria LNG Ltd",
                        "Nigeria LNG"
                      ],
                      "permId": [
                        "5000722697"
                      ],
                      "mainCountry": [
                        "ng"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "Rivers, Nigeria"
                      ],
                      "country": [
                        "ng"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "25.60"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-bfb1c3e563da1f5a5c360157b4a5cd02b7adb9a4",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://reports.shell.com/annual-report/2023/_assets/downloads/shell-annual-report-2023.pdf",
                  "https://www.shell.no/"
                ],
                "asset": [
                  {
                    "id": "NK-W2nEHkWthAk5fwFpSExRzA",
                    "caption": "Norske Shell",
                    "schema": "Company",
                    "properties": {
                      "mainCountry": [
                        "no"
                      ],
                      "address": [
                        "Rogaland, Norway"
                      ],
                      "country": [
                        "no"
                      ],
                      "alias": [
                        "A/S Norske Shell"
                      ],
                      "name": [
                        "Norske Shell A/S",
                        "Norske Shell"
                      ],
                      "website": [
                        "https://www.shell.no/"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "permId": [
                        "4295885635"
                      ],
                      "legalForm": [
                        "A/S"
                      ],
                      "leiCode": [
                        "213800F4ETX85XLF5K47"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "gem-own-e100001013986",
                      "oc-companies-gb-oe026447",
                      "lei-213800F4ETX85XLF5K47"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-bd11e47d8d302e3ad4f5ab0110f9c9e985a0c2cd",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000002875",
                    "caption": "Shell Energy Operations",
                    "schema": "Company",
                    "properties": {
                      "leiCode": [
                        "529900GV6QOT0U2ZAZ38"
                      ],
                      "address": [
                        "Queensland, Australia"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "weakAlias": [
                        "Shell Energy"
                      ],
                      "mainCountry": [
                        "au"
                      ],
                      "legalForm": [
                        "Pty Ltd"
                      ],
                      "permId": [
                        "5001214386"
                      ],
                      "name": [
                        "Shell Energy Operations Pty Ltd",
                        "Shell Energy Operations"
                      ],
                      "alias": [
                        "ERM Power"
                      ],
                      "country": [
                        "au"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "sourceUrl": [
                  "https://ermpower.com.au/about-erm/our-story/",
                  "https://www.shell.com/privacy/shell-group-companies-list.html"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-9fa894a63678791db013102950cf302723f64695",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "46.10"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015211",
                    "caption": "LOOP",
                    "schema": "Company",
                    "properties": {
                      "mainCountry": [
                        "us"
                      ],
                      "permId": [
                        "4297932915"
                      ],
                      "legalForm": [
                        "LLC"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "name": [
                        "LOOP LLC",
                        "LOOP"
                      ],
                      "address": [
                        "Louisiana, Delaware, United States"
                      ],
                      "country": [
                        "us"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "sourceUrl": [
                  "https://www.fitchratings.com/research/corporate-finance/fitch-affirms-loop-llc-at-bbb-outlook-stable-07-10-2022"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-3603aef2648ccff28291f250e643b3f727adbb97",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://search.gleif.org/"
                ],
                "asset": [
                  {
                    "id": "NK-XuJ5JRJfMntcrpkUBjs9u5",
                    "caption": "Shell Nederland Raffinaderij",
                    "schema": "Company",
                    "properties": {
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "nl"
                      ],
                      "name": [
                        "Shell Nederland Raffinaderij"
                      ],
                      "address": [
                        "Zuid-Holland, Netherlands"
                      ],
                      "leiCode": [
                        "2138009FAB375EZDNU25"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "permId": [
                        "4298332901"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "gem-own-e100000001665",
                      "lei-2138009FAB375EZDNU25"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-62b213a4df10029a77497030873b4fa2aa98214f",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.spse.fr/en/about-us-network-management-shareholders.php"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015713",
                    "caption": "Société du Pipeline Sud-Européen SA",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "mainCountry": [
                        "fr"
                      ],
                      "website": [
                        "https://www.spse.fr/"
                      ],
                      "permId": [
                        "5000972303"
                      ],
                      "address": [
                        "France"
                      ],
                      "legalForm": [
                        "SA"
                      ],
                      "alias": [
                        "SOCIETE DU PIPELINE SUD-EUROPEEN"
                      ],
                      "country": [
                        "fr"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "name": [
                        "Société du Pipeline Sud-Européen SA",
                        "Société du Pipeline Sud-Européen"
                      ],
                      "weakAlias": [
                        "SPSE"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-07-21T12:45:21"
                  }
                ],
                "percentage": [
                  "13.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-80a950f66177b2f80d55e7dec62963068741db08",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://power.mhi.com/regions/amer/news/200107.html",
                  "https://valorinternational.globo.com/business/news/2025/01/10/shell-mitsubishi-power-reportedly-hire-itau-bba-for-marlim-azul-sale.ghtml"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000003539",
                    "caption": "Arke Energia",
                    "schema": "Company",
                    "properties": {
                      "alias": [
                        "Marlim Azul Energia"
                      ],
                      "mainCountry": [
                        "br"
                      ],
                      "name": [
                        "Arke Energia SA",
                        "Arke Energia"
                      ],
                      "address": [
                        "São Paulo -, Brazil"
                      ],
                      "legalForm": [
                        "SA"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "br"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "percentage": [
                  "29.90"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-73017c1ecf0544339daf7054cf9d647c580ad83e",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "gem-own-e100001015993",
                    "caption": "Rosneft-Shell Caspian Ventures",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "permId": [
                        "5035713174"
                      ],
                      "website": [
                        "https://rosneft-shellcaspian.com/"
                      ],
                      "address": [
                        "Cyprus"
                      ],
                      "name": [
                        "Rosneft-Shell Caspian Ventures",
                        "Rosneft-Shell Caspian Ventures Ltd"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "legalForm": [
                        "Ltd"
                      ],
                      "mainCountry": [
                        "cy"
                      ],
                      "country": [
                        "cy"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "sourceUrl": [
                  "https://www.power3point0.org/2022/07/20/sanctioning-pipelines-and-oligarchs-is-not-a-silver-bullet-to-stop-putins-war-in-ukraine/"
                ],
                "percentage": [
                  "49.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-5c8f32518e2e49fb5e70f1c12319d739cea0de0d",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100002004819",
                    "caption": "Shell Gas",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "BV"
                      ],
                      "name": [
                        "Shell Gas",
                        "Shell Gas BV"
                      ],
                      "mainCountry": [
                        "nl"
                      ],
                      "address": [
                        "Zuid-Holland, Netherlands"
                      ],
                      "permId": [
                        "5036879644"
                      ],
                      "country": [
                        "nl"
                      ],
                      "description": [
                        "legal entity"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-bdb3b6d53a4877467536d6c76b21dce994df7956",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "asset": [
                  {
                    "id": "NK-GWCukmmeQL296EDZcyXkJi",
                    "caption": "Shell Deutschland",
                    "schema": "Company",
                    "properties": {
                      "country": [
                        "de"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "mainCountry": [
                        "de"
                      ],
                      "leiCode": [
                        "213800VBMNEKDCASIO50"
                      ],
                      "legalForm": [
                        "GmbH"
                      ],
                      "name": [
                        "Shell Deutschland GmbH",
                        "Shell Deutschland"
                      ],
                      "permId": [
                        "4297177127"
                      ],
                      "address": [
                        "Hamburg, Germany"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "lei-213800VBMNEKDCASIO50",
                      "gem-own-e100000004022"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2024-06-30T00:00:00"
                  }
                ],
                "sourceUrl": [
                  "https://search.gleif.org/#/record/213800VBMNEKDCASIO50"
                ],
                "percentage": [
                  "100.00"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2024-06-30T00:00:00"
            },
            {
              "id": "gem-own-6277314f9e9da538545aee20c1e1d7edb1dfa578",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "asset": [
                  {
                    "id": "NK-UdUY2UCPG69U89TwmKWUHq",
                    "caption": "Shell Group Holding",
                    "schema": "Company",
                    "properties": {
                      "legalForm": [
                        "Ltd"
                      ],
                      "mainCountry": [
                        "gb"
                      ],
                      "name": [
                        "Shell Group Holding",
                        "Shell Group Holding Ltd"
                      ],
                      "leiCode": [
                        "2138001GYK62SDP6CH49"
                      ],
                      "permId": [
                        "5086897880"
                      ],
                      "registrationNumber": [
                        "14865121"
                      ],
                      "country": [
                        "gb"
                      ],
                      "address": [
                        "London, City of, United Kingdom"
                      ],
                      "description": [
                        "legal entity"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [
                      "gb-coh-psc-12251164-khazqx7-ehtd3u8jdis72yr2vbq",
                      "gem-own-e100002001367",
                      "lei-2138001GYK62SDP6CH49"
                    ],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "100.00"
                ],
                "sourceUrl": [
                  "https://www.gov.uk/get-information-about-a-company"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            },
            {
              "id": "gem-own-19863f48518dc3adb21b35ceaac53620e3dd8d46",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "sourceUrl": [
                  "https://www.power3point0.org/2022/07/20/sanctioning-pipelines-and-oligarchs-is-not-a-silver-bullet-to-stop-putins-war-in-ukraine/",
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section_2113846431/link_list/links/item5.stream/1742873105897/80dd2a0664db6dc6ac1c376e9425ec9321fb9740/additional-information-ar24.pdf",
                  "https://www.cpc.ru/en/operations/Pages/shippers.aspx"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "percentage": [
                  "100.00"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100001015661",
                    "caption": "Oryx Caspian Pipeline",
                    "schema": "Company",
                    "properties": {
                      "name": [
                        "Oryx Caspian Pipeline",
                        "Oryx Caspian Pipeline LLC"
                      ],
                      "legalForm": [
                        "LLC"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "us"
                      ],
                      "address": [
                        "Delaware, Delaware, United States"
                      ],
                      "permId": [
                        "5053129367"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-47668da0ff0af61bc303991e3a94742b9caab276",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "100.00"
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.shell.com/investors/results-and-reporting/annual-report/_jcr_content/root/main/section/promo/links/item0.stream/1742873115632/6c20b8111738b9a590ba145f0d1c4fa0e530dae0/shell-annual-report-2024.pdf"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000004021",
                    "caption": "Shell Chemical Appalachia",
                    "schema": "Company",
                    "properties": {
                      "permId": [
                        "5053128283"
                      ],
                      "mainCountry": [
                        "us"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "address": [
                        "United States"
                      ],
                      "legalForm": [
                        "LLC"
                      ],
                      "name": [
                        "Shell Chemical Appalachia LLC",
                        "Shell Chemical Appalachia"
                      ],
                      "country": [
                        "us"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": false,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-02-21T08:20:02",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2025-11-04T15:57:36"
            },
            {
              "id": "gem-own-61558bc859e0263375d19025e38136a0e5368593",
              "caption": "Ownership",
              "schema": "Ownership",
              "properties": {
                "percentage": [
                  "16.80"
                ],
                "asset": [
                  {
                    "id": "gem-own-e100000003659",
                    "caption": "North Caspian Operating Company NV",
                    "schema": "Company",
                    "properties": {
                      "topics": [
                        "sanction.linked"
                      ],
                      "legalForm": [
                        "NV"
                      ],
                      "permId": [
                        "5035466438"
                      ],
                      "address": [
                        "Kazakhstan, Atyraū oblysy"
                      ],
                      "alias": [
                        "BRANCH OF \"NORT KASPIAN OPEREJTING KOMPANI N.V.\"",
                        "North Caspian Operating Company NV (Atyrau Branch)",
                        "ФИЛИАЛ \"НОРТ КАСПИАН ОПЕРЕЙТИНГ КОМПАНИ Н.В.\""
                      ],
                      "mainCountry": [
                        "kz"
                      ],
                      "website": [
                        "https://www.ncoc.kz/"
                      ],
                      "weakAlias": [
                        "NCOC"
                      ],
                      "name": [
                        "North Caspian Operating Company",
                        "\"НОРТ КАСПИАН ОПЕРЕЙТИНГ КОМПАНИ Н.В.\" ФИЛИАЛ",
                        "North Caspian Operating Company NV"
                      ],
                      "description": [
                        "legal entity"
                      ],
                      "country": [
                        "kz"
                      ]
                    },
                    "datasets": [
                      "core_watchlist"
                    ],
                    "referents": [],
                    "target": true,
                    "first_seen": "2024-06-30T00:00:00",
                    "last_seen": "2026-03-19T08:25:26",
                    "last_change": "2025-11-04T15:57:36"
                  }
                ],
                "owner": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "sourceUrl": [
                  "https://www.ncoc.kz/kk/page/our-management"
                ]
              },
              "datasets": [
                "core_watchlist"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2024-06-30T00:00:00",
              "last_seen": "2026-02-21T08:20:02",
              "last_change": "2026-02-04T20:01:12"
            }
          ],
          "securities": [
            {
              "id": "isin-GB00BP6MXD84",
              "caption": "Shell Plc",
              "schema": "Security",
              "properties": {
                "name": [
                  "Shell Plc"
                ],
                "country": [
                  "gb"
                ],
                "topics": [
                  "reg.warn"
                ],
                "issuer": [
                  "NK-LMTrFEeQAQjLvZU8zn7m3V"
                ],
                "programId": [
                  "EU-ESMA"
                ],
                "isin": [
                  "GB00BP6MXD84"
                ]
              },
              "datasets": [
                "sanctions"
              ],
              "referents": [],
              "target": true,
              "first_seen": "2024-07-17T19:07:02",
              "last_seen": "2026-05-12T19:07:01",
              "last_change": "2025-09-12T19:07:02"
            }
          ]
        },
        "datasets": [
          "core_watchlist"
        ],
        "referents": [
          "gb-coh-psc-OE026447-guzyy53r5aevkbs0e1jux3y2wda",
          "oc-companies-gb-04366849",
          "lei-21380068P1DRHMJ8KU70",
          "gem-own-e100000000746"
        ],
        "target": false,
        "first_seen": "2024-06-30T00:00:00",
        "last_seen": "2026-03-18T19:07:01",
        "last_change": "2026-02-04T20:01:12"
      }
    },
    {
      "match_id": "M-3",
      "entity_id": "NK-EjPcazMv7uDGNDd4HJQ8MF",
      "schema_type": "Person",
      "caption": "Kevin Shell",
      "aliases": [
        "Kevin Shell"
      ],
      "score": 0.8233,
      "risk_level": "MEDIUM",
      "topic_risk": 0.0,
      "primary_topic": null,
      "match_features": {
        "name_match": 0.8666666666666667
      },
      "topics": [
        "debarment"
      ],
      "datasets": [
        "crime"
      ],
      "sources": [
        {
          "identifier": "crime",
          "title": "crime",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [],
      "nationalities": [],
      "countries": [
        "us"
      ],
      "id_numbers": [],
      "positions": [],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/NK-EjPcazMv7uDGNDd4HJQ8MF/",
      "status": "potential",
      "name": "Kevin Shell",
      "deep_dive": {
        "id": "NK-EjPcazMv7uDGNDd4HJQ8MF",
        "caption": "Kevin Shell",
        "schema": "Person",
        "properties": {
          "notes": [
            "(also F. Allied Construction Company, Inc)"
          ],
          "address": [
            "Clarkston, MI 48348"
          ],
          "name": [
            "Kevin Shell"
          ],
          "firstName": [
            "Kevin"
          ],
          "country": [
            "us"
          ],
          "createdAt": [
            "2023-09-05"
          ],
          "topics": [
            "debarment"
          ],
          "lastName": [
            "Shell"
          ],
          "sanctions": [
            {
              "id": "usgsa-5770a0591d76cc28a62c6faf1072ab14a3c53c55",
              "caption": "Reciprocal",
              "schema": "Sanction",
              "properties": {
                "startDate": [
                  "2023-09-01"
                ],
                "status": [
                  "Active"
                ],
                "listingDate": [
                  "2023-09-05"
                ],
                "authority": [
                  "FHWA"
                ],
                "sourceUrl": [
                  "https://sam.gov/data-services/Exclusions/Public%20V2?privacy=Public"
                ],
                "entity": [
                  "NK-EjPcazMv7uDGNDd4HJQ8MF"
                ],
                "program": [
                  "Reciprocal"
                ],
                "provisions": [
                  "Ineligible (Proceedings Pending)"
                ],
                "country": [
                  "us"
                ]
              },
              "datasets": [
                "crime"
              ],
              "referents": [],
              "target": false,
              "first_seen": "2026-03-30T15:36:11",
              "last_seen": "2026-05-12T14:38:55",
              "last_change": "2026-03-30T15:36:11"
            }
          ]
        },
        "datasets": [
          "crime"
        ],
        "referents": [
          "usgsa-s4mrqsb8f",
          "usgsa-25609672ce40a9c83f5931e0e8d6224b8ae562b7"
        ],
        "target": true,
        "first_seen": "2026-03-30T15:36:11",
        "last_seen": "2026-05-12T14:38:55",
        "last_change": "2026-03-30T15:36:11"
      }
    },
    {
      "match_id": "M-4",
      "entity_id": "Q16753282",
      "schema_type": "Person",
      "caption": "Jonathan Shell",
      "aliases": [
        "Jonathan Shell"
      ],
      "score": 0.8233,
      "risk_level": "MEDIUM",
      "topic_risk": 0.6,
      "primary_topic": "role.pep",
      "match_features": {
        "name_match": 0.8666666666666667
      },
      "topics": [
        "role.pol",
        "role.pep"
      ],
      "datasets": [
        "core_watchlist"
      ],
      "sources": [
        {
          "identifier": "core_watchlist",
          "title": "core_watchlist",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [
        "1987-12-01"
      ],
      "nationalities": [],
      "countries": [],
      "id_numbers": [],
      "positions": [
        "member of the Kentucky House of Representatives"
      ],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/Q16753282/",
      "status": "potential",
      "name": "Jonathan Shell",
      "deep_dive": {
        "id": "Q16753282",
        "caption": "Jonathan Shell",
        "schema": "Person",
        "properties": {
          "classification": [
            "State government (unknown status)"
          ],
          "wikidataId": [
            "Q16753282"
          ],
          "name": [
            "Jonathan Shell"
          ],
          "birthDate": [
            "1987-12-01"
          ],
          "topics": [
            "role.pol",
            "role.pep"
          ],
          "citizenship": [
            "us"
          ],
          "gender": [
            "male"
          ],
          "wikipediaUrl": [
            "https://enwiki.wikipedia.org/wiki/Jonathan_Shell"
          ],
          "lastName": [
            "Shell"
          ],
          "firstName": [
            "Jonathan"
          ],
          "education": [
            "Eastern Kentucky University"
          ],
          "notes": [
            "American politician"
          ],
          "birthPlace": [
            "Danville"
          ],
          "website": [
            "http://shellforkentucky.com/"
          ],
          "political": [
            "Republican Party"
          ],
          "position": [
            "member of the Kentucky House of Representatives"
          ],
          "positionOccupancies": [
            {
              "id": "NK-mmgLMV5UDk29mEFbw48EoT",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q16753282"
                ],
                "post": [
                  {
                    "id": "Q20065966",
                    "caption": "Member of the Kentucky House of Representatives",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.legislative",
                        "gov.state"
                      ],
                      "name": [
                        "Member of the Kentucky House of Representatives",
                        "member of the Kentucky House of Representatives"
                      ],
                      "country": [
                        "us"
                      ],
                      "subnationalArea": [
                        "Kentucky"
                      ],
                      "wikidataId": [
                        "Q20065966"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "plural-7df71ec36f53c9115a54b7ee8080fff6e9a842db"
                    ],
                    "target": false,
                    "first_seen": "2023-09-01T18:30:01",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-d216a7b12951588374959b4a2e32a70fc629cb2f",
                "wd-f4ea491272ad9adea9195e1edda594690e045102"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            }
          ]
        },
        "datasets": [
          "core_watchlist"
        ],
        "referents": [],
        "target": true,
        "first_seen": "2023-04-20T10:30:17",
        "last_seen": "2026-03-19T08:30:26",
        "last_change": "2026-03-16T11:28:59"
      }
    },
    {
      "match_id": "M-5",
      "entity_id": "Q16753282",
      "schema_type": "Person",
      "caption": "Jonathan Shell",
      "aliases": [
        "Jonathan Shell"
      ],
      "score": 0.8233,
      "risk_level": "MEDIUM",
      "topic_risk": 0.6,
      "primary_topic": "role.pep",
      "match_features": {
        "name_match": 0.8666666666666667
      },
      "topics": [
        "role.pep"
      ],
      "datasets": [
        "peps"
      ],
      "sources": [
        {
          "identifier": "peps",
          "title": "peps",
          "publisher": null,
          "publisher_country": null,
          "source_url": null,
          "frequency": null
        }
      ],
      "birth_dates": [
        "1987-12-01"
      ],
      "nationalities": [],
      "countries": [],
      "id_numbers": [],
      "positions": [],
      "gender": [],
      "sanctions": [],
      "passports": [],
      "addresses": [],
      "family": [],
      "ownership": [],
      "opensanctions_url": "https://www.opensanctions.org/entities/Q16753282/",
      "status": "potential",
      "name": "Jonathan Shell",
      "deep_dive": {
        "id": "Q16753282",
        "caption": "Jonathan Shell",
        "schema": "Person",
        "properties": {
          "classification": [
            "State government (unknown status)"
          ],
          "wikidataId": [
            "Q16753282"
          ],
          "name": [
            "Jonathan Shell"
          ],
          "birthDate": [
            "1987-12-01"
          ],
          "topics": [
            "role.pol",
            "role.pep"
          ],
          "citizenship": [
            "us"
          ],
          "gender": [
            "male"
          ],
          "wikipediaUrl": [
            "https://enwiki.wikipedia.org/wiki/Jonathan_Shell"
          ],
          "lastName": [
            "Shell"
          ],
          "firstName": [
            "Jonathan"
          ],
          "education": [
            "Eastern Kentucky University"
          ],
          "notes": [
            "American politician"
          ],
          "birthPlace": [
            "Danville"
          ],
          "website": [
            "http://shellforkentucky.com/"
          ],
          "political": [
            "Republican Party"
          ],
          "position": [
            "member of the Kentucky House of Representatives"
          ],
          "positionOccupancies": [
            {
              "id": "NK-mmgLMV5UDk29mEFbw48EoT",
              "caption": "Occupancy",
              "schema": "Occupancy",
              "properties": {
                "holder": [
                  "Q16753282"
                ],
                "post": [
                  {
                    "id": "Q20065966",
                    "caption": "Member of the Kentucky House of Representatives",
                    "schema": "Position",
                    "properties": {
                      "topics": [
                        "gov.legislative",
                        "gov.state"
                      ],
                      "name": [
                        "Member of the Kentucky House of Representatives",
                        "member of the Kentucky House of Representatives"
                      ],
                      "country": [
                        "us"
                      ],
                      "subnationalArea": [
                        "Kentucky"
                      ],
                      "wikidataId": [
                        "Q20065966"
                      ]
                    },
                    "datasets": [
                      "peps"
                    ],
                    "referents": [
                      "plural-7df71ec36f53c9115a54b7ee8080fff6e9a842db"
                    ],
                    "target": false,
                    "first_seen": "2023-09-01T18:30:01",
                    "last_seen": "2026-05-12T13:37:01",
                    "last_change": "2026-01-15T03:48:43"
                  }
                ]
              },
              "datasets": [
                "peps"
              ],
              "referents": [
                "wd-d216a7b12951588374959b4a2e32a70fc629cb2f",
                "wd-f4ea491272ad9adea9195e1edda594690e045102"
              ],
              "target": false,
              "first_seen": "2024-10-11T11:32:54",
              "last_seen": "2026-05-06T03:53:24",
              "last_change": "2026-03-16T11:27:08"
            }
          ]
        },
        "datasets": [
          "core_watchlist"
        ],
        "referents": [],
        "target": true,
        "first_seen": "2023-04-20T10:30:17",
        "last_seen": "2026-03-19T08:30:26",
        "last_change": "2026-03-16T11:28:59"
      }
    }
  ]
};

export const NO_MATCH_EXAMPLE_RESPONSE = {
  "screening_id": "281e5503-bfd8-4171-a57b-6db4769a3fba",
  "overall_status": "clear",
  "risk_level": "LOW",
  "match_count": 0,
  "screened_at": "2026-05-14T12:43:35.336178",
  "query": {
    "name": "sdkfjhasd asdfasdf",
    "type": "individual",
    "details": {
      "name": "sdkfjhasd asdfasdf",
      "birth_date": "",
      "nationality": ""
    }
  },
  "matches": []
};

export const COMPANY_CLEAR_EXAMPLE_RESPONSE = {
  "screening_id": "79544971-5aae-4df2-9888-87789b0c13cc",
  "overall_status": "clear",
  "risk_level": "LOW",
  "match_count": 0,
  "screened_at": "2026-05-14T12:55:23.932676",
  "query": {
    "name": "safasdfasd",
    "type": "company",
    "details": {
      "name": "safasdfasd",
      "country": ""
    }
  },
  "matches": []
};