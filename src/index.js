"use strict";
import { ClientServerManager }  from "./clientServerManager";
import { User, Expense, Utils, EditableField , CompanyEnum }  from "./basicClasses";


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
        // for import export
        this._data = {
            info : {},
            users : {},
            expenses : [],
            groups : [],
            rules : {},
        };
        // Computed members
        this._users = {};
        this._nb_users = 0;
        this._totalCost = 0;
        this._totalSub = 0;
        this._byPerson = {};
        this._byGroup = {};

        // Init
        this._data = content;
        this.rebuild();

        // UI
        this.infoEditableFields = {};
    }

    recompute()
    {
        this._nb_users = 0;
        this._byPerson = {};
        this._byGroup = {};
        this._totalCost = 0;
        this._totalSub = 0;
        let nonSuperUsers = [];
        for (const user of Object.values(this._users))
        {
            if (user.isSuperUser) continue;
            this._byPerson[user.id] = 0;
            this._nb_users++;
            nonSuperUsers.push(user.id);
        }
        for (let exp of this.expenses)
        {
            let fromUser = this.users[exp.from];
            // person
            if (this._byPerson[exp.from]) // not found means super user
            {
                this._byPerson[exp.from] += this.expenses.cost;
            }
            let targetUsersIds = exp.target || nonSuperUsers;
            for (let userId of targetUsersIds)
            {
                this._byPerson[user.id] -= exp.cost / this._nb_users;
            }
            // group
            if (this._byGroup[exp.group] == null)
            groups: this.groups,
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
        this.recompute();
        this.manager.saveContent(this._data);
    }

    rebuild()
    {
        // clear data
        this._users = {};
        this._nb_users = 0;
        this._totalCost = 0;
        this._totalSub = 0;
        this._byPerson = {};
        this._byGroup = {};
        // users
        for (let u of this._data?.users || [])
        {
            let user = new User(u);
            if (user.id)
                this.users[id] = user;
        }
        if (Object.keys(this._users).length === 0)
        {
            this._users[0] = new User({ firstname: "Dassault", name: "Sport", company: CompanyEnum.DA, isSuperUser : true, id: 0});
        }
        this.expenses = [];
        for (let e of this._data?.expenses || [])
        {
            if (e)
                this.expenses.push(new Expense(e));
        }

        this._data.groups = this._data.groups || DEFAULT_GROUPS;
        this._data.rules = this._data.rules || DEFAULT_RULES;
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
        for (const [id, path, editable, type] of [
            ["#info-title", "_data.info.title", true, "text"],
            ["#info-where", "_data.info.destination", true, "text"],
            ["#info-type", "_data.info.type", true, "text"],
            ["#info-start-date", "_data.info.start", true, "date"],
            ["#info-end-date", "_data.info.end", true, "date"],
            ["#info-resp", "_data.info.responsible", true, "text"],
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
        let val = this._nb_users ? (this._totalCost - this._totalSub) / this._nb_users : 0;
        val = Math.round(val*100) / 100;
        Utils.setText("#info-avg", val);

    }


    buildUsers()
    {
        let tbody = document.querySelector("#users-table tbody")
        tbody.innerHTML = "";
        this.usersEditableFields = {};
        /*for (let idx=0;idx<this._users.length;idx++)
        {
            let user = this.users[idx];
        }*/
        // console.log(byPerson);
    }

    addEmptyRow(idx)
    {
        let tr = document.createElement("tr");
        // action
        for (let [key, editable, type, data] of [
            ["id", true, "icon", { iconName:"" , callback : null}],
            ["name", true, "text", undefined],
            ["firstname", true, "text", undefined],
            ["company", true, "combo", { items : CompanyEnum }],
            ["company", true, "combo", { items : CompanyEnum }],
        ])
        {
            let td = document.createELement("td");
            td.className = "boder-bottom-0";
            let field = new EditableField(td, `users.${idx}.${key}`, this, editable, type, data);
            if (key == "id" )
            {
                callback = (e)=>{
                    this.removeUser(field);
                }
            }
            tbody.appendChild(tr);
        }
        tbody.appendChild(tr);
    }
    static async main()
    {
        let manager = new ClientServerManager();
        let content = await manager.fetchSavedContent();
        let front = new FrontPage(manager, content);
        console.log(front)
        window.front = front;
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
        front.buildUsers();
        // front.buildSummary();
    }
}

FrontPage.main();