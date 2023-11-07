let cardDB = {}, cardData = [], card_sets = {}, banlist_info = [], archetype = [];
const v_input = document.querySelector('#inputSearch');
const v_result = document.getElementById("result");
const v_deck = document.querySelector(".deck");
const v_info = document.querySelector(".info");
const v_loading = document.querySelector("#loading");
let decks = [], tmpDeck = { 1: [], 2: [], 3: [] };
let shuffleDeck = [];
let decks2;

v_loading.style.display = 'block';
let v_ajax = new XMLHttpRequest();
let v_ajax2 = new XMLHttpRequest();
v_ajax2.open("GET", "./decks.json");
v_ajax2.onload = function(){
    data = JSON.parse(v_ajax2.response);
    decks2 = data['data'];
    console.log(decks2);
}
v_ajax2.send();

v_ajax.open("GET", "https://db.ygoprodeck.com/api/v7/cardinfo.php");
v_ajax.onload = function () {
    cardDB = JSON.parse(v_ajax.response);
    cardData = cardDB['data'];
    for (let i = 0; i < cardData.length; i++) {
        if (banlist_info.indexOf(cardData[i]) == -1
            && cardData[i]['banlist_info']) {
            banlist_info.push(cardData[i]);
        }

        if (cardData[i]['card_sets']) {
            for (let j = 0; j < cardData[i]['card_sets'].length; j++) {
                if (!card_sets[cardData[i]['card_sets'][j]['set_name']]) {
                    card_sets[cardData[i]['card_sets'][j]['set_name']] = [];
                }
                card_sets[cardData[i]['card_sets'][j]['set_name']].push(cardData[i]);
            }
        }

        if (cardData[i]['archetype']) {
            if (archetype.indexOf(cardData[i]['archetype']) == -1) {
                archetype.push(cardData[i]['archetype']);
            }
        }
    }

    v_arr = {}
    for (let i = 0; i < cardData.length; i++) {
        for (let j = 0; j < archetype.length; j++) {
            if (cardData[i]['archetype'] == archetype[j] || cardData[i]['desc'].indexOf(archetype[j]) != -1) {
                if (v_arr[archetype[j]]) {
                    v_arr[archetype[j]] += 1;
                } else {
                    v_arr[archetype[j]] = 1;
                }
            }
        }
    }

    v_tmp = {};
    for (let i = 0; i < archetype.length; i++) {
        if (v_arr[archetype[i]] >= 40 && v_arr[archetype[i]] <= 75) {
            v_tmp[archetype[i]] = v_arr[archetype[i]];
        }
    }
    console.log(v_tmp);
    console.log(cardData);
    console.log(banlist_info);
    console.log(card_sets);
    //decks = localStorage.getItem("decks");
    v_loading.style.display = 'none';
}
v_ajax.send();

function f_search() {
    v_loading.style.display = 'block';
    v_result.innerHTML = '';
    for (let i = 0; i < cardData.length; i++) {
        if (cardData[i]['name'].toLowerCase().indexOf(v_input.value.toLowerCase()) != -1 &&
            cardData[i]['frameType'].indexOf('token') == -1 &&
            cardData[i]['frameType'].indexOf('skill') == -1) {
            f_slot(cardData[i]['card_images'][0]['image_url'], cardData[i]['id']);
        }
    }
    v_loading.style.display = 'none';
}

function f_slot(p_src, p_id) {
    let v_img = document.createElement('img');
    v_img.src = p_src;
    v_img.width = 100;
    v_img.id = p_id;
    v_img.addEventListener('contextmenu', () => {
        event.preventDefault();
        event.stopPropagation();
    });
    v_img.addEventListener('mousedown', () => {
        if (event.button == 0) {
            f_info(event.target.id);
        }
        else if (event.button == 1) {
            f_appendCard(event, 3);
        }
        else if (event.button == 2) {
            for (let i = 0; i < cardData.length; i++) {
                if (cardData[i]['id'] == p_id) {
                    if (cardData[i]['type'].indexOf('Fusion') != -1
                        || cardData[i]['type'].indexOf('Synchro') != -1
                        || cardData[i]['type'].indexOf('XYZ') != -1
                        || cardData[i]['type'].indexOf('Link') != -1) {
                        f_appendCard(event, 2);
                    } else {
                        f_appendCard(event, 1);
                        v_deck.children[8].innerHTML = '';
                    }
                }
            }
        }
    });
    v_result.appendChild(v_img);
}

function f_appendCard(p_event, n) {
    let v_card = document.createElement('img');
    v_card.src = p_event.target.src;
    v_card.width = 50;
    v_card.id = p_event.target.id;
    v_card.addEventListener('mousedown', () => {
        if (event.button == 0) {
            f_info(event.target.id);
        }
        if (event.button == 2) {
            v_deck.children[n].removeChild(event.target);
            tmpDeck[n].slice(tmpDeck[n].indexOf(event.target.id), 1);
        }
    });

    let cnt = 0;
    for (let i = 1; i <= 3; i++) {
        for (let j = 0; j < tmpDeck[i].length; j++) {
            if (tmpDeck[i][j] == event.target.id) {
                cnt++;
            }
        }
    }

    if (cnt < 3) {
        if ((n == 1 && v_deck.children[n].childElementCount < 61)
            || n != 1 && v_deck.children[n].childElementCount < 16) {
            v_deck.children[n].appendChild(v_card);
            tmpDeck[n].push(p_event.target.id);
        }
    }
}

function f_info(p_id) {
    v_info.innerHTML = '';
    let v_cardData = {};
    for (let i = 0; i < cardData.length; i++) {
        if (cardData[i]['id'] == p_id) {
            v_cardData = cardData[i];
        }
    }
    console.log(v_cardData);

    let v_img = document.createElement('img');
    v_img.src = v_cardData['card_images'][0]['image_url_cropped'];
    v_img.style.width = '100%';
    v_info.appendChild(v_img);

    let v_name = document.createElement('p');
    v_name.innerHTML = v_cardData['name'];
    v_info.appendChild(v_name);

    let v_desc = document.createElement('p');
    v_desc.innerHTML = v_cardData['desc'];
    v_info.appendChild(v_desc);

    let v_btn = document.createElement('button');
    v_btn.innerHTML = "이 카드를 사용한 덱 보기";
    v_btn.addEventListener("click", () => {
        v_result.innerHTML = '';
        for (let i = 0; i < decks2.length; i++) {
            for (let j = 0; j < decks2[i]['deckCetegory'].length; j++) {
                if(v_cardData['name'].indexOf(decks2[i]["deckCetegory"][j]) != -1){
                    let v_div = document.createElement('div');
                    v_div.innerHTML = decks2[i]["deckName"];
                    v_div.addEventListener("click", ()=>{
                        f_reset();
                        v_deck.children[0].children[0].value = decks2[i]['deckName'];
                        v_deck.children[0].children[1].value = decks2[i]['deckCetegory'];
                        for (let d = 1; d <= 3; d++) {
                            for (let n= 0; n < decks2[i]["deck"][d].length; n++) {
                                let v_card = document.createElement('img');
                                v_card.src = "./resources/552E46D7356720000F.jpeg";
                                for (let k = 0; k < cardData.length; k++) {
                                    if (decks2[i]["deck"][d][n] == cardData[k]['name']) {
                                        v_card.src = cardData[k]['card_images'][0]['image_url'];
                                        v_card.id = cardData[k]['id'];
                                        tmpDeck[d].push(cardData[k]['id']);
                                        break;
                                    }
                                    // v_card.id = '';
                                    // tmpDeck[d].push('');
                                }
                                v_card.width = 50;
                                v_card.addEventListener('mousedown', () => {
                                    if (event.button == 0) {
                                        f_info(event.target.id);
                                    }
                                    if (event.button == 2) {
                                        v_deck.children[d].removeChild(event.target);
                                        tmpDeck[d].slice(tmpDeck[n].indexOf(event.target.id), 1);
                                    }
                                });
                                v_deck.children[d].appendChild(v_card);
                            }
                        }
                    });
                    v_result.appendChild(v_div);
                }
            }            
        }        
    });
    v_info.appendChild(v_btn);

    if (v_cardData['card_sets']) {
        let v_ul = document.createElement("ul");
        for (let j = 0; j < v_cardData['card_sets'].length; j++) {
            let str = '';
            for (let i = 0; i < cardData.length; i++) {
                if (cardData[i]['card_sets']) {
                    if (cardData[i]['card_sets'][j]) {
                        if (v_cardData['card_sets'][j]['set_name'] == cardData[i]['card_sets'][j]['set_name']) {
                            str += cardData[i]['card_images'][0]['image_url'] + " ";
                        }
                    }

                }
            }
            let v_li = document.createElement('li');
            let v_sets = document.createElement('a');
            v_sets.innerHTML = v_cardData['card_sets'][j]['set_name'];
            v_sets.href = "./store.html?set_name=" + v_cardData['card_sets'][j]['set_name'] +
                "&card_set=" + str;
            v_li.appendChild(v_sets);
            v_ul.appendChild(v_li);
        }
        v_info.appendChild(v_ul);
    }
}

function f_five() {
    v_deck.children[8].innerHTML = '';
    shuffleDeck = [];
    let idx, len;
    for (let i = 1; i < v_deck.children[1].childElementCount; i++) {
        idx = Math.floor(Math.random() * (v_deck.children[1].childElementCount - 1)) + 1;
        if (shuffleDeck.indexOf(idx) == -1) {
            shuffleDeck.push(idx);
        } else { i--; }
    }

    if (v_deck.children[1].childElementCount < 5) {
        len = v_deck.children[1].childElementCount - 1;
    } else { len = 5; }

    for (let i = 0; i < len; i++) {
        let v_img = document.createElement('img');
        let shffle_idx = shuffleDeck.pop();
        v_img.id = v_deck.children[1].children[shffle_idx].id;
        for (let j = 0; j < cardData.length; j++) {
            if (cardData[j]['id'] == v_img.id) {
                v_img.src = cardData[j]['card_images'][0]['image_url'];
            }
        }
        v_img.width = 96;
        v_img.addEventListener("mousedown", () => {
            if (event.button == 0) {
                f_info(event.target.id);
            }
        });
        v_deck.children[8].appendChild(v_img);
    }
}

function f_draw() {
    if (v_deck.children[8].childElementCount < v_deck.children[1].childElementCount - 1) {
        let v_img = document.createElement('img');
        let shffle_idx = shuffleDeck.pop();
        v_img.id = v_deck.children[1].children[shffle_idx].id;
        for (let i = 0; i < cardData.length; i++) {
            if (cardData[i]['id'] == v_img.id) {
                v_img.src = cardData[i]['card_images'][0]['image_url'];
            }
        }
        v_img.width = 96;
        v_img.addEventListener("mousedown", () => {
            if (event.button == 0) {
                f_info(event.target.id);
            }
        });
        v_deck.children[8].appendChild(v_img);
        v_deck.children[8].scrollTop = v_deck.children[8].scrollHeight;
    }
}

function f_reset() {
    v_deck.children[0].children[0].value = '';
    v_deck.children[0].children[1].value = '';
    v_deck.children[1].innerHTML = "<p>메인 덱</p>";
    v_deck.children[2].innerHTML = "<p>엑스트라 덱</p>";
    v_deck.children[3].innerHTML = "<p>사이드 덱</p>";
    v_deck.children[8].innerHTML = '';
    tmpDeck = { 1: [], 2: [], 3: [] };
}

function f_save() {
    let deckName = v_deck.children[0].children[0].value;

    for (let k = 0; k < decks.length; k++) {
        if (decks[k]["deckName"] == deckName) {
            decks.slice(k,1);
        }
    }

    if (deckName != '' && decks.length < 10) {
        let v_div = document.createElement('div');
        let v_img = document.createElement('img');
        let v_p = document.createElement('p');
        v_img.src = "./resources/552E46D7356720000F.jpeg";
        v_img.width = 100;
        v_p.innerHTML = deckName;
        v_img.addEventListener("dblclick", () => {
            deckName = event.target.parentElement.children[1].innerHTML;

            for (let d = 0; d < decks.length; d++) {
                if (decks[d]["deckName"] == deckName) {
                    f_reset();
                    v_deck.children[0].children[0].value = decks[d]['deckName'];
                    v_deck.children[0].children[1].value = decks[d]['deckCategory'];
                    for (let i = 1; i <= 3; i++) {
                        for (let j = 0; j < decks[d]["deck"][i].length; j++) {
                            for (let k = 0; k < cardData.length; k++) {
                                if (decks[d]["deck"][i][j] == cardData[k]['id']) {
                                    let v_card = document.createElement('img');
                                    v_card.src = cardData[k]['card_images'][0]['image_url'];
                                    v_card.width = 50;
                                    v_card.id = cardData[k]['id'];
                                    v_card.addEventListener('mousedown', () => {
                                        if (event.button == 0) {
                                            f_info(event.target.id);
                                        }
                                        if (event.button == 2) {
                                            v_deck.children[i].removeChild(event.target);
                                            tmpDeck[i].slice(tmpDeck[n].indexOf(event.target.id), 1);
                                        }
                                    });

                                    v_deck.children[i].appendChild(v_card);
                                    tmpDeck[i].push(cardData[k]['id']);
                                }
                            }
                        }
                    }
                }
            }
        });
        v_div.appendChild(v_img);
        v_div.appendChild(v_p);
        v_div.classList.add("decks");
        v_deck.children[9].appendChild(v_div);
        v_deck.children[9].scrollTop = v_deck.children[9].scrollHeight;
        decks.push({ "deckId": decks.length > 0 ? decks[decks.length]["deckId"]+1 : 1,
            "deckName": deckName, "deckCategory": v_deck.children[0].children[1].value, "deck": tmpDeck })
        //localStorage.setItem("decks", decks);
    }
}

function f_enter() {
    if (event.key == 'Enter') {
        f_search();
    }
}
