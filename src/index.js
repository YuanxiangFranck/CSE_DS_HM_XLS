"use strict";
import { ClientServerManager }  from "./clientServerManager";
import { User, Expense, Utils, EditableField }  from "./basicClasses";


const DEFAULT_GROUPS = ["Misc","Guide","Location","Logement","Transport" ];

const DEFAULT_RULES = {
    "Guide" : { ratio: 0.6 },
    "Location" : { ratio: 0.5 },
    "Transport" : { ratio: 0.5 },
    "Logement" : { ratio: 0.5,  maxi_pp: 50 }
};

class FrontPage
{
    constructor(clientServerManager, content)
    {
        this.manager = clientServerManager;
        this.info = {};
        this.users = [];
        this.expenses = [];
        this.groups = [];
        this.rules = {};
        this._nb_users = 0;
        this._totalCost = 0;
        this.rebuild(content);
        this.editableFields = {};
    }

    buildEditableField(id, )
    {
    }
    switchEditableField(id, mode, path)
    {

    }

    recompute()
    {
        this._nb_users = this.users.reduce((acc,val)=>val.isSuper ? acc : acc+1, 0);
        this._totalCost = this.expenses.reduce((acc, val)=>acc+val.cost, 0);
    }
    pushData()
    {
        this.recompute()
        this.manager.saveContent({
            info: this.info,
            users : this.users.map((u)=>u.name),
            expenses : this.expenses.map(e=>e.toJson()),
            groups: this.groups,
            rules : this.rules
        })
    }

    rebuild(content)
    {
        // clear data
        this.info = content.info
        this.users = content?.users?.map((u)=>new User(u)) || [];
        this.expenses = content?.expenses?.map((e)=>Expense.fromJson(e)) || [];
        this.groups = content.groups || DEFAULT_GROUPS;
        this.rules = content.rules || DEFAULT_RULES;
        this.recompute();
    }

    applyRule(group, sum)
    {
        const rule = this.rules[group];
        if (rule == null) return sum;
        let sub = 0;
        if (rule.ratio)
        {
            sub = sum*rule.ratio;
        }
        if (rule.maxi_pp)
        {
            sub = Math.min(sub, self.users)
        }
        return sub;
    }

    addUser(name, push=true)
    {
        this.users.push(new User(name));
        if (push) this.pushData()
    }

    addUsers(names, push=true)
    {
        for (const name of names)
            this.addUser(name, false);
        if (push) this.pushData()
    }

    addExpense(expens, push=true)
    {
        this.expenses.push(expens);
        if (push) this.pushData()
    }
    addExpenses(expenses, push=true)
    {
        for (const e of expenses)
            this.addExpense(e, false);
        if (push) this.pushData();
    }

    buildInfo()
    {
        console.log(this.info);
        let body = document.getElementById("main-summary");
        let name = document.getElementById("info-title");
        name.innerText = this.info.title;
        for (const [id, path, editable] of [
            ["info-title", "info.title", true],
            ["info-start-date", "info.start", true],
            ["info-end-date", "info.end", true],
            ["info-resp", "info.responsible", true],
            ["info-nb-users", "_nb_users", false]
        ])
        {
            this.editableFields[id] = new EditableField(id, path, this, editable);
        }
        let iconDiv = document.getElementById("info-icon");
        let iconI = iconDiv.querySelector("i");
        let textColor="text-white";
        let bg="bg-secondary";
        let iIcon = "ti ti-mountain";
        switch (this.info.type)
        {
            default: // icon montagne
        }

        iconDiv.className = `${textColor} ${bg} rounded-circle p-6 d-flex align-items-center justify-content-center`;
        iconI.className = `${iIcon} fs-6`;
    }

    buildExpenses()
    {
        // console.log(this.expenses)

    }
    buildSummary()
    {
        let byGroups = {};
        let total = 0;
        for (const exp of this.expenses)
        {
            if (byGroups[exp.group] == null)
                byGroups[exp.group] = { cost: 0, sub: 0};
            byGroups[exp.group].cost += exp.cost;
            total += exp.cost;
        }
        for (const [group, val] of Object.entries(byGroups))
        {
            val.sub = this.applyRule(group, val.cost)
        }
        // console.log(byGroups);

        // console.log(total);
    }

    buildPerPerson()
    {
        let byPerson = {};
        let all_users = [];
        for (const user of this.users)
        {
            if (user.isSuper) continue;
            byPerson[user.name] = 0;
            all_users.push[user.name];
        }
        for (let exp of this.expenses)
        {
            if (byPerson[exp.from]) // not found means super user
            {
                byPerson[exp.from] += this.expenses.cost;
            }
            let users = exp.target || all_users;
            let nb_users = users.length;
            for (let user of users)
            {
                byPerson[user] -= exp.cost / nb_users;
            }
        }
        // console.log(byPerson);
    }
    switchToEdit(mode)
    {
        const readOnly = mode !== 0;
        // update nav bag
        Utils.toggleVisible("ui-edit-commit", !readOnly);
        Utils.toggleVisible("ui-edit-cancel", !readOnly);
        Utils.toggleVisible("ui-edit-start", readOnly);
        // Update info
        for (let obj of Object.values(this.editableFields))
        {
            obj.toggle(readOnly, mode==1)
        }
        this.pushData();

    }
    static async main()
    {
        let manager = new ClientServerManager();
        let content = await manager.fetchSavedContent();
        // console.log(content)
        let front = new FrontPage(manager, content);
        window.clear = ()=>front.rebuild();
        window.debug = ()=>{
            front.info = {
                title: "WE Alpi Débutant Juin",
                type: "Alpinisme",
                start: "9/07/2023",
                end: "11/07/2023",
                responsible : "Franck WANG"
            }
            front.addUsers(["__super__CE", "aaaaa", "bbbbb", "ccccccccc", "Franck WANG"])
            front.users[0]._isSuper
            front.addExpenses([
                new Expense(null, "CE",          "Zébulon", 100, "Guide", null),
                new Expense(null, "Franck WANG", "Location Matos", 100, "Location", ["bbbbb"]),
            ])
        }

        front.buildInfo();
        front.buildExpenses();
        // front.buildSummary();
        front.switchToEdit(-1);
        // build event listeners
        document.getElementById("ui-edit-start").addEventListener("click", front.switchToEdit.bind(front, 0));
        document.getElementById("ui-edit-commit").addEventListener("click", front.switchToEdit.bind(front, 1));
        document.getElementById("ui-edit-cancel").addEventListener("click", front.switchToEdit.bind(front, -1));
    }
}

FrontPage.main();