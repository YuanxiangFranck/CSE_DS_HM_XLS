"use strict";
import { ClientServerManager }  from "./clientServerManager";
import { User, Expense, Utils, EditableField }  from "./basicClasses";


const DEFAULT_GROUPS = ["Guide","Location","Logement","Transport", "Misc"];

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
        // Computed members
        this._nb_users = 0;
        this._totalCost = 0;
        this._totalSub = 0;
        this._users = []; // without super
        this._byPerson = {};
        this._byGroup = {};

        // Init
        this.rebuild(content);
        this.infoEditableFields = {};
    }

    recompute()
    {
        this._users = [];
        this._nb_users = 0;
        this._byPerson = {};
        this._byGroup = {};
        this._totalCost = 0;
        this._totalSub = 0;
        for (const user of this.users)
        {
            if (user.isSuper) continue;
            this._byPerson[user.name] = 0;
            this._users.push[user.name];
            this._nb_users++;
        }
        for (let exp of this.expenses)
        {
            // person
            if (this._byPerson[exp.from]) // not found means super user
            {
                this._byPerson[exp.from] += this.expenses.cost;
            }
            let users = exp.target || this._users;
            let nb_users = users.length;
            for (let user of users)
            {
                this._byPerson[user] -= exp.cost / nb_users;
            }
            // group
            if (this._byGroup[exp.group] == null)
                this._byGroup[exp.group] = { cost: 0, sub: 0};
            this._byGroup[exp.group].cost += exp.cost;
            this._totalCost += exp.cost;
            let sub = this.applyRule(exp.group, exp.cost);
            this._byGroup[exp.group].cost += sub;
            this._totalSub += sub;
        }
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
        this.users = [];
        for (let u of content?.users || [])
        {

            if(u)
                this.users.push(new User(u));
        }
        this.expenses = [];
        for (let e of content?.expenses || [])
        {
            if (e)
                this.expenses.push(Expense.fromJson(e));
        }

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
        for (const [id, path, editable, type] of [
            ["#info-title", "info.title", true, "text"],
            ["#info-where", "info.destination", true, "text"],
            ["#info-type", "info.type", true, "text"],
            ["#info-start-date", "info.start", true, "date"],
            ["#info-end-date", "info.end", true, "date"],
            ["#info-resp", "info.responsible", true, "text"],
            ["#info-nb-users", "_nb_users", false, "text"]
        ])
        {
            this.infoEditableFields[id] = new EditableField(id, path, this, editable, type);
        }
        this.switchToEditInfo(-1);
        // build event listeners
        document.getElementById("info-edit-start").addEventListener("click", this.switchToEditInfo.bind(this, 0));
        document.getElementById("info-edit-commit").addEventListener("click", this.switchToEditInfo.bind(this, 1));
        document.getElementById("info-edit-cancel").addEventListener("click", this.switchToEditInfo.bind(this, -1));
    }

    switchToEditInfo(mode)
    {
        const readOnly = mode !== 0;
        // update nav bag
        Utils.toggleVisible("#info-edit-commit", !readOnly);
        Utils.toggleVisible("#info-edit-cancel", !readOnly);
        Utils.toggleVisible("#info-edit-start", readOnly);
        // Update info
        for (let obj of Object.values(this.infoEditableFields))
        {
            obj.toggle(readOnly, mode==1)
        }
        this.pushData();

    }

    buildExpenses()
    {
        // console.log(this.expenses)
        Utils.setText("#info-spent", this._totalCost);
        Utils.setText("#info-sub", this._totalCost);
        let val = (this._totalCost - this._totalSub) / this._nb_users;
        val = Math.round(val*100) / 100;
        Utils.setText("#info-avg", val);

    }
    buildSummary()
    {
        // console.log(byGroups);

        // console.log(total);
    }

    buildPerPerson()
    {
        // console.log(byPerson);
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
    }
}

FrontPage.main();