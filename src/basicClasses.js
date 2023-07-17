
let STATIC_USER_COUNT = 0;

export const CompanyEnum = {
    DS: 0,
    DSExt: 1,
    DA: 2,
    DAExt: 3
};
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
        this.when = input.when;
        this.from = input.from;
        this.what = input.what;
        this.cost = input.cost;
        this.group = input.group;
        this.target = input.target;
    }

}

export class Utils
{
    static applyRule(group, sum, rules, nb_p=0)
    {
        const rule = rules[group];
        if (rule == null) return sum;

    }

    static getElems(id)
    {
        let out = id  instanceof HTMLElement ? [id ] : document.querySelectorAll(id);
        if (out.length === 0) throw new Error("Empty selection");
        return out;
    }
    static setText(id, content)
    {
        for (let elem of Utils.getElems(id))
            elem.innerHTML = content;
    }

    static toggleVisible(id, visible)
    {
        for (let elem of Utils.getElems(id))
            elem.style.display = visible ? "flex" : "none";
    }

    static setAttr(obj, path, val)
    {
        let tmp = obj;
        for (let i=0;i<path.length;i++)
        {
            if (i===path.length-1)
            {
                tmp[path[i]] = val;
            }
            tmp = tmp[path[i]];
        }
    }
    static getAttr(obj, path)
    {
        let tmp = obj;
        for (let i=0;i<path.length;i++)
        {
            if (i===path.length-1)
            {
                return tmp[path[i]];
            }
            tmp = tmp[path[i]];
        }
        return undefined;
    }

}