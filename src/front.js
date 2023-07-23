import { ClientServerManager }  from "./clientServerManager";
import { EditableField }  from "./editableField";
import { Data, User, Expense, CompanyEnum , GroupsEnum}  from "./dataModel";
import { Utils }  from "./utils";

"use strict";

const EditionModeEnum = {
    Editable: 0x01,
    ReadOnly: 0x10,
}
const EditionStateEum = {
    StartEdit: 0x001,
    Commit: 0x010,
    Abort: 0x110
};

const CompanyEnumColor = Object.fromEntries([
    [CompanyEnum.DS, "bg-primary"],
    [CompanyEnum.DSExt, "bg-primary"],
    [CompanyEnum.DA, "bg-secondary"],
    [CompanyEnum.DAExt, "bg-secondary"]
]);

const GroupsEnumColor = Object.fromEntries([
    [GroupsEnum.Guide, "bg-primary"],
    [GroupsEnum.Location, "bg-secondary"],
    [GroupsEnum.Transport, "bg-success"],
    [GroupsEnum.Logement, "bg-warning"],
    [GroupsEnum.Misc, "bg-dark"]
]);

export class FrontPage
{
    constructor(clientServerManager, content)
    {
        this.manager = clientServerManager;
        // Computed members
        this._users = {};
        this._nb_users = 0;
        this._totalCost = 0;
        this._totalSub = 0;
        this._byPerson = {};
        this._byGroup = {};

        // UI
        this.infoEditableFields = {};
        this.usersEditableFields = {};
        this.expensesEditableFields = {};

        // Init
        this.state = EditionModeEnum.ReadOnly;
        // for import export
        try
        {
            this._data = new Data(content);
        }
        catch(e)
        {
            console.error(e);
            console.warn("Issues in the data form cache.... clear data for now")
            this._data = new Data({});
        }
        // compute values
        this.preProcessing();
    }
    get readOnly()
    {
        return this.state & EditionModeEnum.ReadOnly;
    }
    /**
     * preProcessing values from data
     */
    preProcessing()
    {
        this._nb_users = 0;
        this._byGroup = {};
        this._totalCost = 0;
        this._totalSub = 0;
        let nonSuperUsers = [];

        for (const user of Object.values(this._data.users))
        {
            if (user.isSuperUser) continue;
            this._nb_users++;
            nonSuperUsers.push(user.id);
        }
        for (let exp of Object.values(this._data.expenses))
        {
            // person
            let targetUsersIds = exp.target;
            if (targetUsersIds === "All"  ) targetUsersIds = nonSuperUsers;
            for (let userId of targetUsersIds)
            {
                this._data.users[userId]._toPay -= exp.cost / this._nb_users;
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
    pushData(compute=true)
    {
        if (compute)
            this.preProcessing();
        this.manager.saveContent(this._data);
    }

    applyRule(group, sum)
    {
        const rule = this._data.rules[group];
        if (rule == null) return 0;
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

    switchToEdit(mode, push=true)
    {
        const readOnly = mode&EditionModeEnum.ReadOnly;
        const isCancel = mode == EditionStateEum.Abort;
        const isCommit = mode == EditionStateEum.Commit;
        // update nav bag
        Utils.toggleVisible("#info-edit-commit", !readOnly);
        Utils.toggleVisible("#info-edit-cancel", !readOnly);
        Utils.toggleVisible("#info-edit-start", readOnly);
        Utils.toggleVisible("#user-edit-add", !readOnly);
        Utils.toggleVisible("#expenses-edit-add", !readOnly);
        // Update info
        this.state = mode;
        if (!readOnly)
        {
            // start edit backup for abort
            this._dataOld = this._data;
            this._data = new Data(this._data);
        }
        else
        {
            if (isCancel)
                this._data = this._dataOld;
            this._dataOld = undefined;
        }
        for (let toLoop of Object.values(this.usersEditableFields))
        {
            for (let obj of toLoop)
                obj.toggle(readOnly, isCommit);
        }
        for (let toLoop of Object.values(this.expensesEditableFields))
        {
            for (let obj of toLoop)
                obj.toggle(readOnly, isCommit);
        }
        if (readOnly)
            this.preProcessing();
        for (let obj of Object.values(this.infoEditableFields))
        {
            obj.toggle(readOnly, isCommit);
        }
        this.buildSummary();
        if (readOnly && push)
            this.pushData(false);

    }


    addEventListener()
    {
        // build event listeners
        document.getElementById("info-edit-start").addEventListener("click", this.switchToEdit.bind(this, EditionStateEum.StartEdit));
        document.getElementById("info-edit-commit").addEventListener("click", this.switchToEdit.bind(this, EditionStateEum.Commit));
        document.getElementById("info-edit-cancel").addEventListener("click", this.switchToEdit.bind(this, EditionStateEum.Abort));
        document.getElementById("user-edit-add").addEventListener("click", this.addRowUser.bind(this, undefined));
        document.getElementById("expenses-edit-add").addEventListener("click", this.addRowExpense.bind(this, undefined));
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
            this.infoEditableFields[id] = new EditableField(this.readOnly, id, path, this, editable, type);
        }
    }

    buildSummary()
    {
        Utils.setText("#info-spent", this._totalCost);
        Utils.setText("#info-sub", this._totalSub);
        let val = this._nb_users ? (this._totalCost - this._totalSub) / this._nb_users : 0;
        val = Math.round(val*100) / 100;
        Utils.setText("#info-avg", val);
    }

    buildUsers()
    {
        let tbody = document.querySelector("#users-table tbody")
        tbody.innerHTML = "";
        for (let idx of Object.keys(this._data.users))
        {
            this.addRowUser(idx);
        }
    }

    addRowUser(idx)
    {
        let user;
        if (idx == null)
        {
            user = new User({});
            idx = user.id;
            this._data.users[idx] =user;
        }
        else
        {
            user = this._data.users[idx];
        }
        let tbody = document.querySelector("#users-table tbody");
        let tr = document.createElement("tr");
        let fields = [];
        // action
        for (let [key, editable, type, data] of [
            ["id", true, "icon", {
                iconName:"ti ti-trash" ,
                onClick : ()=>this.removeUser(idx),
                canFail: true
            }],
            ["firstname", true, "text", {canFail: true}],
            ["name", true, "text", {canFail: true}],
            ["company", true, "combo", { items : CompanyEnumColor, canFail: true}],
            ["toPay", false, "text", {canFail: true}],
        ])
        {
            let td = document.createElement("td");
            td.className = "boder-bottom-0";
            let field = new EditableField(this.readOnly, td, `_data.users.${idx}.${key}`, this, editable && !user.isSuperUser, type, data);
            tr.appendChild(td);
            fields.push(field);
        }
        this.usersEditableFields[`user_${idx}`] = fields;
        tbody.appendChild(tr);
    }

    removeUser(idx)
    {
        delete this._data.users[idx];
        let editables = this.usersEditableFields[`user_${idx}`];
        let first = editables[0];
        let torm = first.html.parentElement;
        torm.parentElement.removeChild(torm);
    }

    buildExpenses()
    {
        let tbody = document.querySelector("#expenses-table tbody")
        tbody.innerHTML = "";
        for (let idx of Object.keys(this._data.expenses))
        {
            this.addRowExpense(idx);
        }
    }
    addRowExpense(idx)
    {

        let exp;
        if (idx == null)
        {
            exp = new Expense({});
            idx = exp.id;
            this._data.expenses[idx] = exp;
        }
        else
        {
            exp = this._data.expenses[idx];
        }
        let tbody = document.querySelector("#expenses-table tbody");
        let tr = document.createElement("tr");
        let fields = [];
        let usersFrom = {};
        let usersTo= { "All" : "badge bg-primary"};
        for (let user of Object.values(this._data.users))
        {
            usersFrom[user.id] = null; // mandatory
            if (user.isSuperUser) continue;
            usersTo[user.id] = null; // mandatory
        }
        // action
        for (let [key, type, data] of [
            ["id", "icon", {
                iconName:"ti ti-trash" ,
                onClick : ()=>this.removeExpense(idx),
                canFail: true
            }],
            ["when", "date", {canFail: true}],
            ["what", "text", {canFail: true}],
            ["cost", "number", {canFail: true}],
            ["group", "combo", { items : GroupsEnumColor, canFail: true}],
            ["from", "combo", {
                items : usersFrom, canFail: true,
                displayCb: (idx)=>this._data.users[idx].fullname
            }],
            ["target",  "combo", {
                items: usersTo, canFail: true,
                multipleChoice: true,
                displayCb: (idx)=>idx == "All" ? "Tous" : this._data.users[idx].shortname
            }],
        ])
        {
            let td = document.createElement("td");
            td.className = "boder-bottom-0";
            let field = new EditableField(this.readOnly, td, `_data.expenses.${idx}.${key}`, this, true, type, data);
            tr.appendChild(td);
            fields.push(field);
        }
        this.expensesEditableFields[idx] = fields;
        tbody.appendChild(tr);
    
    }
    removeExpense(idx)
    {

    }

    static async main()
    {
        let manager = new ClientServerManager();
        let content = await manager.fetchSavedContent();
        let front = new FrontPage(manager, content);
        console.log(front)
        window.front = front;

        front.buildInfo();
        front.buildSummary();
        front.buildUsers();
        front.buildExpenses();
        front.addEventListener();
        front.switchToEdit(EditionStateEum.Commit, false);
    }
}
