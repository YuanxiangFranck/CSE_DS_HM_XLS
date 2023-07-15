const SUPER_USER_PREFIX = "__super__";
let USER_COUNT = 1;
export class User
{
    constructor (name, isSuperUser=false)
    {
        if (name == null) 
        {
            name = `User ${USER_COUNT++}`;
        }
        if (isSuperUser)
        {
            this._name = SUPER_USER_PREFIX + name;
            this.isSuper = true;
        }
        else
        {
            this._name = name;
            this.isSuper = name.startsWith(SUPER_USER_PREFIX);
        }
    }

    get name()
    {
        if (this.isSuper)
            return this._name.replace(SUPER_USER_PREFIX, "");
        return this._name;
    }
}

export class Expense
{
    constructor (when, from, what, cost, group, target )
    {
        this.when = when;
        this.from = from;
        this.what = what;
        this.cost = cost;
        this.group = group;
        this.target = target;
    }

    toJson()
    {
        return {
            when : this.when,
            from : this.from,
            what : this.what,
            cost : this.cost,
            group : this.group,
            target : this.target,
        };
    }

    static fromJson(input)
    {
        return new Expense(input.when, input.from, input.what, input.cost, input.group, input.target);
    }
}

export class EditableField
{
    constructor (htmlId, field_path, front, editable, type)
    {
        this.htmlId = htmlId;
        this.path = field_path.split(".");
        this.front = front;
        this.editable = editable;
        this.type = type;
        this.readOnly = true; // init by buidl
        this._buildReadOnly(this.getAttr());
    }
    getAttr()
    {
        return Utils.getAttr(this.front, this.path);
    }

    setAttr(content)
    {
        Utils.setAttr(this.front, this.path, content);
    }

    toggle(toReadOnly, commit)
    {
        if (!this.editable) return;
        const targetReadOnly = toReadOnly == null ? !this.readOnly : toReadOnly;
        if (targetReadOnly == this.readOnly)
            return; // nothing to do
        let content = Utils.getAttr(this.front, this.path);
        if (targetReadOnly)
        {
            if (commit)
            {
                let obj = document.querySelector(`${this.htmlId} input`);
                if (obj.value && obj.value !== "")
                {
                    content = obj.value;
                    this.setAttr(content);
                }
            }
            this._buildReadOnly(content)
        }
        else
        {
            this._buildEditable(content);
        }
        this.readOnly = targetReadOnly;
    }

    _buildReadOnly(content)
    {
        Utils.setText(this.htmlId, content);
    }

    _buildEditable(content)
    {
        let input = document.createElement("input");
        input.setAttribute("type", this.type);
        input.setAttribute("placeholder", content);
        if (this.type == "date")
        {
            input.value = content;
        }
        let elem = document.querySelector(this.htmlId);
        elem.innerHTML = ""; // lazy empty
        elem.appendChild(input);
    }

}

export class Utils
{
    static applyRule(group, sum, rules, nb_p=0)
    {
        const rule = rules[group];
        if (rule == null) return sum;

    }

    static setText(id, content)
    {
        for (let elem of document.querySelectorAll(id))
            elem.innerHTML = content;
    }

    static toggleVisible(id, visible)
    {
        for (let elem of document.querySelectorAll(id))
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