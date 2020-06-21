let Game = {
    Watts: 0,
    WPS: 0,
    building: [0,0,0,0,0,0],
    Log: ["","","","","","","",""],
    upgrades: [],
    multiplier: [1,1,1,1,1,1],
    clickPower: 1,
    Sol: 0,
    Time: "00:00",
    LogStatus: {
        SolarPanel: 0,
        PotatoBattery: 0,
        RadioactiveMaterial: 0,
        PotatoField: 0,
        NuclearStation: 0,
        GeothermalStation: 0,
        Watts: 0,
        WPS: 0,
    },
}

let intro = 0

let continueAnimating = true;

let formatNumber = function(num) {
    let numSplit, int, dec, intout, sub;

    num = Math.abs(num)
    num = num.toFixed(2);

    numSplit = num.split(".")
    int = numSplit[0];

    intout = ''
    for (let i = 0; i < int.length / 3; i++) {
        if (i === 0) {
            sub =  int.length % 3 === 0 ? 3 : int.length % 3
            intout += int.substr(0, sub);
        } else {
            intout += ',' + int.substr(sub + ((i-1) * 3), 3)
        }
    }

    dec = numSplit[1];
    
    return intout;

};

let insertLog = function(text) {
    Game.Log.unshift(text);
    Game.Log.pop()
    let fields = document.querySelectorAll(".log__text")
    let fieldsArr = Array.prototype.slice.call(fields)
    fieldsArr.forEach((e,i) => {
        if (i === 0) {
            for (let i = 0; i < Game.Log[0].length; i++) {
                setTimeout(() => {
                    e.textContent = Game.Log[0].substring(0,i + 1)
                }, i * 20)
            }
        } else {
            e.textContent = Game.Log[i]
        }

    })
}

let DOM = {
    container: ".container" 
}


// timeout's for story line
{
    insertLog("You are the only survivor on mars after a hurricane")
    setTimeout(() => {
        insertLog("You need to harness enough energy to start up your rocket")
    }, 3000)
    setTimeout(() => {
        insertLog("10,000,000 to be exact")
    }, 5500)
    setTimeout(() => {
        insertLog("click the blue button to start harnessing energy")
        setTimeout(() => {
            intro = 1
        },2500)
    }, 8500)
}

let loop = function () {

    // 20 fps
    if (continueAnimating) {
        setTimeout(() => requestAnimationFrame(loop), 1000 / 20)


        //update Watts by watts per second and update UI
        {
            let baseProduction = [0.1, 1, 5, 20, 80, 600];
            //change numbers
            let WPS = 0
            for (let i = 0; i < 6; i++) {
                WPS += baseProduction[i] * Game.building[i] * Game.multiplier[i]  / 20;
            }
            Game.Watts += WPS
            // change UI
            fields = document.querySelectorAll(".stats__text");
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr[0].textContent = "Watts: " + formatNumber(Game.Watts)

            fieldsArr[1].textContent = "Watts per hour (wph): " + (WPS * 20 < 10 ? Math.round(WPS * 20 * 10) / 10 : formatNumber(WPS * 20))
            Game.WPS = WPS * 20
        }


        //change time 
        {
            //change Numbers
            let times = Game.Time.split(":")
            times[0] = parseInt(times[0])
            times[1] = parseInt(times[1])

            times[1] += 60 / 20
            if (times[1] >= 60) {
                times[0] += 1
                times[1] -= 60
            }
            if (times[0] >= 24 && times[1] >= 39) {
                Game.Sol++;
                times[0] -= 24
                times[1] -= 39
            }

            times[0] = times[0].toString()
            times[1] = times[1].toString()
            if(times[1].length === 1) {
                times[1] = "0" + times[1]
            }
            if(times[0].length === 1) {
                times[0] = "0" + times[0]
            }



            Game.Time = `${times[0]}:${times[1]}`;
            //change UI
            fields = document.querySelectorAll(".stats__text");
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr[3].textContent = `Time: ${Game.Time}`
            fieldsArr[2].textContent = `Sol: ${Game.Sol}`
        }


        //toggle classes for "buyable"
        {
            //buildings
            let fields = document.querySelectorAll(".item__value");
            let fieldsArr = Array.prototype.slice.call(fields)
            for (let i = 0; i < 6; i++) {
                fieldsArr[i].classList.remove("red");
                fieldsArr[i].classList.remove("blue");
                const baseCost = [15,100,800,7000,42000,600000]

                if (Game.Watts >= Math.round(baseCost[i] * Math.pow(1.15, Game.building[i]))) {
                    fieldsArr[i].classList.add("blue");
                } else {
                    fieldsArr[i].classList.add("red");
                }
            }

            //Upgrades
            fields = document.querySelectorAll(".item__percentage");
            fieldsArr = Array.prototype.slice.call(fields)
            for (let i = 6; i < fieldsArr.length; i++) {
                fieldsArr[i].classList.remove("red");
                fieldsArr[i].classList.remove("blue");

                if (Game.Watts >= Game.upgrades[i-6].cost) {
                    fieldsArr[i].classList.add("blue");
                } else {
                    fieldsArr[i].classList.add("red");
                }
            }
        }

        //Log Guide and upgrades
        {
            function addUpgrade(name, building, cost) {
                let id;
                class Upgrade {
                    constructor(id, name, building, cost) {
                        this.id = id;
                        this.name = name;
                        this.building = building;
                        this.cost = cost;
                    }
                }

                if (Game.upgrades.length < 1) {
                    id = "upgrade-0"
                } else {
                    id = `upgrade-${Game.upgrades[Game.upgrades.length - 1].id + 1}`
                }
                if (building !== 'End') {
                    Game.upgrades.push(new Upgrade(id, name, building, cost))

                    let html = '<div class="item clearfix" id="%id%"><div class="upgrade__description">%name%</div><div class="right clearfix"><div class="item__value small">x%multi% production <br>on %building%</div><div class="item__percentage red">%cost%</div><div class="item__delete"><button class="item__delete--btn"><i class="iconify" data-icon="ion:add" data-inline="false"></i></button></div></div></div>'
                    let newHtml = html.replace('%id%', id);
                    newHtml = newHtml.replace('%name%', name);
                    newHtml = newHtml.replace('%building%', building);
                    newHtml = newHtml.replace('%cost%', formatNumber(cost));
                    newHtml = newHtml.replace('%multi%', (building === 'Click Power' ? '10' : '2'))
                
                    document.querySelector(".Upgrade__List").insertAdjacentHTML('beforeend', newHtml);
                } else {
                    Game.upgrades.push(new Upgrade(id, name, building, cost))

                    let html = '<div class="item clearfix" id="%id%"><div class="upgrade__description">Rocket Ship</div><div class="right clearfix"><div class="item__value small">Use the power to <br>return home to earth</div><div class="item__percentage red">10,000,000</div><div class="item__delete"><button class="item__delete--btn"><i class="iconify" data-icon="ion:add" data-inline="false"></i></button></div></div></div>'
                    let newHtml = html.replace('%id%', id);
                    document.querySelector(".Upgrade__List").insertAdjacentHTML('beforeend', newHtml);
                }

            
            }

            // date and time
            { 
                if (Game.Time === "00:00") {
                    switch(Game.Sol) {
                        case 1:
                            insertLog("You have survived a sol on mars...")
                            setTimeout(() => {insertLog("Did you know that one day on mars is longer than a day on earth. A day on mars is 24 hours, 39 minutes and 35 seconds.")},3000);
                            break;
                        case 2:
                            insertLog("You have survived your second day on mars")
                            break;
                        case 5:
                            insertLog("5 days on mars and you've adapted nicely")
                            break;
                        case 10:
                            insertLog("10 days gone and your 'getting the hang of mars'")
                            break;
                        case 20:
                            insertLog("20 days down")
                            break;
                        case 50:
                            insertLog("You've survived on mars for 50 days!!!")
                            break;  
                        case 75:
                            insertLog("75 days gone. You can do it")
                            break;     
                        case 100:
                            insertLog("You've hit 100 days. I can now call you a martian")
                            break;   
                        case 200:
                            insertLog("I can't believe that you've survived 200 days. Well done Soldier!")
                            break;   
                    }
                }
            }

            // Solar Panels
            {
                if (Game.LogStatus.SolarPanel === 0 && Game.building[0] > 0) {
                    Game.LogStatus.SolarPanel++
                    insertLog("Your first solar panel. This will produce one watt every 10 hours")
                } 
                if (Game.LogStatus.SolarPanel === 1 && Game.building[0] > 4) {
                Game.LogStatus.SolarPanel++
                insertLog("Look at all the solar panels a line. Beautiful isn't it?")
                addUpgrade("Clean Solar Panels", "Solar Panels", 100)
                }
                if (Game.LogStatus.SolarPanel === 2 && Game.building[0] > 9) {
                Game.LogStatus.SolarPanel++
                addUpgrade("UV light", "Solar Panels", 250)
                } 
                if (Game.LogStatus.SolarPanel === 3 && Game.building[0] > 24) {
                Game.LogStatus.SolarPanel++
                insertLog("You've really gone to town on these solar Panels...")
                addUpgrade("Spriklers", "Solar Panels", 1500)
                }
                if (Game.LogStatus.SolarPanel === 4 && Game.building[0] > 49) {
                Game.LogStatus.SolarPanel++
                insertLog("You have 50 Solor Panels. Nice")
                addUpgrade("Robot cleaners", "Solar Panels", 50000)
                }
                if (Game.LogStatus.SolarPanel === 5 && Game.building[0] > 74) {
                Game.LogStatus.SolarPanel++
                insertLog("You have 50 Solor Panels. Nice")
                addUpgrade("Transparent Dust Covers", "Solar Panels", 1800000)
                }
                if (Game.LogStatus.SolarPanel === 6 && Game.building[0] > 99) {
                Game.LogStatus.SolarPanel++
                insertLog("Look at All the Solar Panels in a shining out. The beauty of it is amazing")
                addUpgrade("LED Artificial light", "Solar Panels", 50000000)
                }

            }

            // Potato Battery
            {
                if (Game.LogStatus.PotatoBattery === 0 && Game.building[1] > 0) {
                    Game.LogStatus.PotatoBattery++
                    insertLog(`Your first potato battery. This will produce ${Game.multiplier[1]} watt an hour`)

                } 
                if (Game.LogStatus.PotatoBattery === 1 && Game.building[1] > 4) {
                    Game.LogStatus.PotatoBattery++
                    insertLog("Potatoes galore")
                    addUpgrade("Bigger Potatoes", "Potato Batteries", 600)
                } 
                if (Game.LogStatus.PotatoBattery === 2 && Game.building[1] > 9) {
                    Game.LogStatus.PotatoBattery++
                    addUpgrade("High Quality Potatoes", "Potato Batteries", 1500)
                    } 
                if (Game.LogStatus.PotatoBattery === 3 && Game.building[1] > 24) {
                    Game.LogStatus.PotatoBattery++
                    insertLog("The power of pototoes")
                    addUpgrade("Better Energy Extraction", "Potato Batteries", 10000)
                }
                if (Game.LogStatus.PotatoBattery === 4 && Game.building[1] > 49) {
                    Game.LogStatus.PotatoBattery++
                    insertLog("That's a lot of potatos")
                    addUpgrade("Extra Soil", "Potato Batteries", 300000)
                }
                if (Game.LogStatus.PotatoBattery === 5 && Game.building[1] > 74) {
                Game.LogStatus.PotatoBattery++
                addUpgrade("Extra Water", "Potato Batteries", 10000000)
                }
                if (Game.LogStatus.PotatoBattery === 6 && Game.building[1] > 99) {
                    Game.LogStatus.PotatoBattery++
                    insertLog("We Have here on mars a congregation of potatoes")
                    addUpgrade("Harvesting Techniques", "Potato Batteries", 300000000)
                }

            }

            // Radioactive Material
            {
                if (Game.LogStatus.RadioactiveMaterial === 0 && Game.building[2] > 0) {
                    Game.LogStatus.RadioactiveMaterial ++
                    insertLog(`This Radioactive substance will produce ${5 * Game.multiplier[2]} watts an hour`)
                } 
                if (Game.LogStatus.RadioactiveMaterial  === 1 && Game.building[2] > 4) {
                    Game.LogStatus.RadioactiveMaterial ++
                    insertLog("Be careful!!! don't drop it")
                    addUpgrade("Hotter Substances", "Radioactive Material", 5300)
                }
                if (Game.LogStatus.RadioactiveMaterial  === 2 && Game.building[2] > 9) {
                    Game.LogStatus.RadioactiveMaterial ++
                    addUpgrade("Bigger Substances", "Radioactive Material", 14000)
                }  
                if (Game.LogStatus.RadioactiveMaterial  === 3 && Game.building[2] > 24) {
                    Game.LogStatus.RadioactiveMaterial ++
                    insertLog("The Radiation produces surprisingly a lot")
                    addUpgrade("Rarer Metal", "Radioactive Material", 80000)
                }
                if (Game.LogStatus.RadioactiveMaterial  === 4 && Game.building[2] > 49) {
                    Game.LogStatus.RadioactiveMaterial ++
                    insertLog("So much Radioactivity")
                    addUpgrade("More Efficient Harvesting", "Radioactive Material", 2700000)
                }
                if (Game.LogStatus.RadioactiveMaterial  === 5 && Game.building[2] > 74) {
                    Game.LogStatus.RadioactiveMaterial ++
                    addUpgrade("Higher Radioactivity Levels", "Radioactive Material", 100000000)
                } 
                if (Game.LogStatus.RadioactiveMaterial  === 6 && Game.building[2] > 99) {
                    Game.LogStatus.RadioactiveMaterial ++
                    insertLog("Radioactive! Radioactive! by Imagine Dragons")
                    addUpgrade("Super Big Substances", "Radioactive Material", 2700000000)
                }

            }

            // Potato Field
            {
                if (Game.LogStatus.PotatoField === 0 && Game.building[3] > 0) {
                    Game.LogStatus.PotatoField++
                    insertLog(`Your first potato field. This will produce ${20 * Game.multiplier[3]} watts an hour`)
                } 
                if (Game.LogStatus.PotatoField === 1 && Game.building[3] > 4) {
                    Game.LogStatus.PotatoField++
                    insertLog("So many potatoes")
                    addUpgrade("Bigger Potatoes", "Potato Fields", 47000)
                } 
                if (Game.LogStatus.PotatoField === 2 && Game.building[3] > 9) {
                    Game.LogStatus.PotatoField++
                    addUpgrade("Bigger Fields", "Potato Fields", 120000)
                } 
                if (Game.LogStatus.PotatoField === 3 && Game.building[3] > 24) {
                    Game.LogStatus.PotatoField+=
                    insertLog("Mass Harvest! Keep it up")
                    addUpgrade("Better Soil", "Potato Fields", 700000)
                }
                if (Game.LogStatus.PotatoField === 4 && Game.building[3] > 49) {
                    Game.LogStatus.PotatoField++
                    insertLog("You're a proffesional farmer... and biologist")
                    addUpgrade("Tractor", "Potato Fields", 23000000)
                }
                if (Game.LogStatus.PotatoField === 5 && Game.building[3] > 74) {
                    Game.LogStatus.PotatoField++
                    addUpgrade("More Efficient Planting", "Potato Fields", 800000000)
                }
                if (Game.LogStatus.PotatoField === 6 && Game.building[3] > 99) {
                    Game.LogStatus.PotatoField++
                    insertLog("We Have here on mars a congregation of a congregation of potatoes")
                    addUpgrade("More Water", "Potato Fields", 20000000000)
                }

            }

            // Nuclear Station
            {
                if (Game.LogStatus.NuclearStation === 0 && Game.building[4] > 0) {
                    Game.LogStatus.NuclearStation++
                    insertLog(`Your first Nuclear Station. This will produce ${80 * Game.multiplier[4]} watts an hour`)
                } 
                if (Game.LogStatus.NuclearStation === 1 && Game.building[4] > 4) {
                    Game.LogStatus.NuclearStation++
                    insertLog("Factories galore")
                    addUpgrade("Better Cooling Fan", "Nuclear Stations", 280000)
                } 
                if (Game.LogStatus.NuclearStation === 2 && Game.building[4] > 9) {
                    Game.LogStatus.NuclearStation++
                    addUpgrade("Bigger Station", "Nuclear Stations", 700000)
                } 
                if (Game.LogStatus.NuclearStation === 3 && Game.building[4] > 24) {
                    Game.LogStatus.NuclearStation++
                    insertLog("So many factories")
                    addUpgrade("More Safety Gear", "Nuclear Stations", 2400000)
                }
                if (Game.LogStatus.NuclearStation === 4 && Game.building[4] > 49) {
                    Game.LogStatus.NuclearStation++
                    insertLog("That's a lot of Nuclear power")
                    addUpgrade("Faster Machinery", "Nuclear Stations", 140000000)
                }
                if (Game.LogStatus.NuclearStation === 5 && Game.building[4] > 74) {
                    Game.LogStatus.NuclearStation++
                    addUpgrade("Bigger Capacitors", "Nuclear Stations", 5000000000)
                } 
                if (Game.LogStatus.NuclearStation === 6 && Game.building[4] > 99) {
                    Game.LogStatus.NuclearStation++
                    insertLog("You are a pro builder")
                    addUpgrade("More Efficient Turbine", "Nuclear Stations", 140000000000)
                }

            }

            // Geothermal Station
            {
                if (Game.LogStatus.GeothermalStation === 0 && Game.building[5] > 0) {
                    Game.LogStatus.GeothermalStation++
                    insertLog("Your first Geothermal energy drill. This will produce 600 watt an hour")
                    insertLog(`Your first Geothermal energy drill. This will produce ${600 * Game.multiplier[5]} watts an hour`)
                } 
                if (Game.LogStatus.GeothermalStation === 1 && Game.building[5] > 4) {
                    Game.LogStatus.GeothermalStation++
                    insertLog("This is the key to getting energy on mars")
                    addUpgrade("More Resistant Drills", "Geothermal Station", 4000000)
                } 
                if (Game.LogStatus.GeothermalStation === 1 && Game.building[5] > 9) {
                    Game.LogStatus.GeothermalStation++
                    insertLog("This is the key to getting energy on mars")
                    addUpgrade("More Efficient Turbines", "Geothermal Station", 10000000)
                } 
                if (Game.LogStatus.GeothermalStation === 2 && Game.building[5] > 24) {
                    Game.LogStatus.GeothermalStation++
                    insertLog("Geothermal energy is the way forward")
                    addUpgrade("Bigger Cooling Fan", "Geothermal Station", 60000000)
                }
                if (Game.LogStatus.GeothermalStation === 3 && Game.building[5] > 49) {
                    Game.LogStatus.GeothermalStation++
                    insertLog("Environmentally friendly energy")
                    addUpgrade("Bigger Station", "Geothermal Station", 2000000000)
                }
                if (Game.LogStatus.GeothermalStation === 4 && Game.building[5] > 74) {
                    Game.LogStatus.GeothermalStation++
                    insertLog("Greta Thunberg would be proud")
                    addUpgrade("Sharper drills", "Geothermal Station", 72000000000)
                }
                if (Game.LogStatus.GeothermalStation === 1 && Game.building[5] > 99) {
                    Game.LogStatus.GeothermalStation++
                    insertLog("This is the key to getting energy on mars")
                    addUpgrade("Stronger Cooling Fan", "Geothermal Station", 2000000000000)
                } 

            }

            // Watts
            {
                if (intro === 1) {
                    if (Game.LogStatus.Watts === 0 && Game.Watts > 14) {
                        Game.LogStatus.Watts++
                        insertLog("hover over solar panel and click the plus button. This will help you accumulate energy")
                    } 
                }
                if (Game.LogStatus.Watts === 1 && Game.Watts > 99) {
                    Game.LogStatus.Watts++
                    insertLog("100 Watts. Now we're talking")
                    addUpgrade("More Efficiency", "All Buildings", 500)
                } 
                if (Game.LogStatus.Watts === 2 && Game.Watts > 999) {
                    Game.LogStatus.Watts++
                    insertLog("1,000 Watts. Keep it up")
                    addUpgrade("Better Resources", "All Buildings", 3000)
                }
                if (Game.LogStatus.Watts === 3 && Game.Watts > 9999) {
                    Game.LogStatus.Watts++
                    insertLog("10,000 Watts. You're getting the hang of this")
                    addUpgrade("Bigger Capacitators", "All Buildings", 30000)
                }
                if (Game.LogStatus.Watts === 4 && Game.Watts > 99999) {
                    Game.LogStatus.Watts++
                    insertLog("100,000 Watts. You're a real genius")
                    addUpgrade("Better Location", "All Buildings", 300000)
                }
                if (Game.LogStatus.Watts === 5 && Game.Watts > 999999) {
                    Game.LogStatus.Watts++
                    insertLog("1 million Watts! Everyone here in Nasa HQ is proud of You")
                    addUpgrade("Launch Rocket", "End", 10000000)
                }

            }

            // Watts per second
            {
                if (Game.LogStatus.WPS === 0 && Game.WPS > 0.4) {
                    Game.LogStatus.WPS++
                    insertLog("Slowly and Steadily the energy is coming through")
                } 
                if (Game.LogStatus.WPS === 1 && Game.WPS > 4.9) {
                    Game.LogStatus.WPS++
                    insertLog("The energy is starting to trickle in")
                } 
                if (Game.LogStatus.WPS === 2 && Game.WPS > 24.9) {
                    Game.LogStatus.WPS++
                    insertLog("25 Watts Per Hour. enough to power a table fan")
                }
                if (Game.LogStatus.WPS === 3 && Game.WPS > 99.9) {
                    Game.LogStatus.WPS++
                    insertLog("100 Watts Per Hour. Enough to power a Sewing Machine")
                    addUpgrade("Bigger Clicks", "Click Power", 1500)
                }
                if (Game.LogStatus.WPS === 4 && Game.WPS > 499.9) {
                    Game.LogStatus.WPS++
                    insertLog("500 Watts Per Hour. Enough to power a Desktop PC")
                }
                if (Game.LogStatus.WPS === 4 && Game.WPS > 999.9) {
                    Game.LogStatus.WPS++
                    insertLog("1000 Watts Per Hour. Enough to power a Laser Printer")
                    addUpgrade("Harder Clicks", "Click Power", 15000)
                }
                if (Game.LogStatus.WPS === 5 && Game.WPS > 9999.9) {
                    Game.LogStatus.WPS++
                    insertLog("10,000 Watts Per Hour. Mars is Turning into a powerHouse")
                    addUpgrade("Stronger Clicks", "Click Power", 150000)
                }
                if (Game.LogStatus.WPS === 6 && Game.WPS > 99999.9) {
                    Game.LogStatus.WPS++
                    insertLog("100,000 Watts Per Hour. You are a real mega-mastermind. Well Done!")
                    addUpgrade("Monumental Clicks", "Click Power", 1500000)
                }

            }



        }
    }

}

//////////////////////////////////////////////////////////////////////////////event Listeners/////////////////////////////////////////////////////////
{





    //add item if enough watts
    document.querySelector(DOM.container).addEventListener('click', (e) => {
        let itemID, splitID, type, ID, baseCost;

        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id
        baseCost = [15,100,800,7000,42000,600000]
        if (itemID) {

            splitID = itemID.split('-')
            type = splitID[0];
            ID = parseInt(splitID[1])

            if (type === "building") {

                // if u have enough money
                if (Game.Watts >= Math.round(baseCost[ID] * Math.pow(1.15, Game[type][ID]))){
                    let fields;
    
                    Game.Watts -= Math.round(baseCost[ID] * Math.pow(1.15, Game[type][ID]))
                    Game[type][ID]++;
                    fields = document.querySelectorAll(".item__value");
                    fieldsArr = Array.prototype.slice.call(fields);
                    for (let i = 0; i < 6; i++) {
                        fieldsArr[i].textContent = formatNumber(Math.round(baseCost[i] * Math.pow(1.15, Game[type][i])));
                    }

                    fields = document.querySelectorAll(".buildings__text");
                    fieldsArr = Array.prototype.slice.call(fields);
                    let buildings = ["Solar Panels: ", "Potato Batteries: ", "Radioactive Material: " , "Potato Fields: ", "Nuclear Station: ", "Geothermal Station: "]
                    for (let i = 0; i < 6; i++) {
                        fieldsArr[i].textContent = buildings[i] + Game.building[i]
                    }
    
    
                }
            }

            

        }
    });

    document.querySelector(".button").addEventListener('click', () => {
        Game.Watts += Game.clickPower;
    })


    document.querySelector(".Upgrade__List").addEventListener('click', (e) => { 

        let itemID = e.target.parentNode.parentNode.parentNode.parentNode.id
            if (itemID) {
    
                // track which item it is
                let ids = Game.upgrades.map(function(e){
                    return e.id;
                });

                item = Game.upgrades[ids.indexOf(itemID)]
                // delete item from the data structure
                if (Game.Watts >= item.cost) {
                    
                    Game.Watts -= item.cost
                    let multiMap = new Map()
                    multiMap.set('Solar Panels', 0)
                    multiMap.set('Potato Batteries', 1)
                    multiMap.set('Radioactive Material', 2)
                    multiMap.set('Potato Fields', 3)
                    multiMap.set('Nuclear Stations', 4)
                    multiMap.set('Geothermal Station', 5)
                    multiMap.set('All Buildings', "all")
                    multiMap.set('Click Power', "clickPower")
                    multiMap.set('End', 'end')
                    
                    let build = multiMap.get(item.building)

                    if (build !== 'end') {
                        if (build === "all") {
                            Game.multiplier = Game.multiplier.map((e) => {
                                return e * 2
                            });
                        } else if (build === "clickPower"){
                            Game.clickPower *= 10
                        } else {
                            Game.multiplier[build] *= 2
                        }
    
                        // delete Item from UI
                        document.getElementById(itemID).parentNode.removeChild(document.getElementById(itemID))
    
                        Game.upgrades.splice(ids.indexOf(itemID),1)
    
                        let fields = document.querySelectorAll(".item__percentage")
                        let fieldsArr = Array.prototype.slice.call(fields)
                        for (let i = 0; i < 6; i++) {
                            let BaseWPS = [0.1, 1, 5, 20, 80, 600]
                            let number = BaseWPS[i] * Game.multiplier[i];
                            let letters = number.toString()
                            if (letters.length < 4) {
                                letters = letters
                            } else {
                                letters = formatNumber(number).toString()
                            }
                            fieldsArr[i].textContent = letters + " wph"
                        }
                    } else {
                        let id = requestAnimationFrame(loop)
                        continueAnimating = false;
                        document.querySelector(".wrapper").parentNode.removeChild(document.querySelector(".wrapper"))
                        let tag = document.createElement("div")
                        tag.classList.add("final__log")
                        document.body.appendChild(tag)

                        let finalSpeech =`You have done Nasa Proud... 
                        You have survived on Mars for ${Game.Sol} Sols... 
                        and In that time you have managed to produce 10,000,000 Watts of energy to start up Your Rocket.
                        Because of You we will have a constant energy supply on mars when we return on further missions.
                        You are one of the bravest Astronauts we have seen and upon your return you will be given a medal of valour.
                        We are so proud of you here at Nasa HQ and we wish you the best, for safe return.
                        You have done good Soldier...
                        You have done good.`
                        for (let i = 0; i < finalSpeech.length; i++) {
                            setTimeout(() => {
                                document.querySelector(".final__log").textContent = finalSpeech.substring(0,i+1)
                            }, (i*45) + 1000)
                        }
                    }

                }
   

            }
    });

}

requestAnimationFrame(loop)
