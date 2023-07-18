"use strict";

let STATIC_USER_COUNT = 0;

const DEFAULT_GROUPS = ["Guide","Location","Logement","Transport", "Misc"];

const DEFAULT_RULES = {
    "Guide" : { ratio: 0.6 },
    "Location" : { ratio: 0.5 },
    "Transport" : { ratio: 0.5 },
    "Logement" : { ratio: 0.5,  maxi_pp: 50 }
};
export const CompanyEnum = {
    DS: "DS",
    DSExt: "DS (Ext)",
    DA: "DA",
    DAExt: "DA (Ext)"
};
const DEFAULT_SUPER_USER = {
    firstname: "Sport", name: "Dassault",
    company: CompanyEnum.DA, isSuperUser : true
};
export class Info
{
    constructor(input)
    {
        this.title = input?.title || "-Nom de la sortie-";
        this.destination = input?.destination || "X";
        this.type = input?.type || "X";
        this.start = input?.start || "DD-MM-YYYY";
        this.end = input?.end || "DD-MM-YYYY";
        this.responsible = input?.responsible || "X";
    }
}

export class User
{
    constructor (input)
    {
        if (typeof input == "string")
        {
            input = JSON.parse(input);
        }
        this.company = input.company || CompanyEnum.DS;
        this.isSuperUser = input.isSuperUser || false;
        let id;
        if (input.id != null)
        {
            STATIC_USER_COUNT = Math.max(STATIC_USER_COUNT, input.id);
            id = input.id;
        }
        else
            id = ++STATIC_USER_COUNT;

        this.id = id;
        this.name = input.name || `Name_${this.id}`;
        this.firstname = input.firstname || `User_${this.id}`;
        this._toPay = 0;
    }

    get fullname()
    {
        return `${this.firstname} ${this.name}`;
    }
    get shortname()
    {
        return `${this.firstname} ${this.name[0]}.`;
    }
    toJson()
    {
        let tmp = {};
        for (let [k,v] of Object.entries(this))
        {
            if (k.startsWith("_")) continue;
            tmp[k] = v;
        }
        return tmp;
    }
}

export class Expense
{
    constructor (input)
    {
        this.when = input?.when;
        this.from = input?.from;
        this.what = input?.what;
        this.cost = input?.cost;
        this.group = input?.group;
        this.target = input?.target;
    }

}

export class Data
{
    constructor(input)
    {
        this.info = new Info(input?.info);
        this.users = {};
        let hasSuper = false;
        for (let u of Object.values(input?.users || {}))
        {
            let user = new User(u);
            if (!user || user.id == null) continue;
            this.users[user.id] = user;
            hasSuper |= user.isSuperUser;
        }
        if (!hasSuper)
        {
            let user = new User(DEFAULT_SUPER_USER)
            this.users[user.id] = user;
        }
        this.expenses = [];
        for (let e of input?.expenses || [])
        {
            if (!e) continue;
            this.expenses.push(new Expense(e));
        }
        this.groups = input?.groups || DEFAULT_GROUPS;
        this.rules = input?.rules || DEFAULT_RULES;
    }
    // Observation pattern
    toJson()
    {
        return "{}";
    }
}
