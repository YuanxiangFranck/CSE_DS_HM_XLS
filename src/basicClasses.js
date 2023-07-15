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
        if (this.isSuper)
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
        if (input == null) return undefined;
        return new Expense(input.when, input.from, input.what, input.cost, input.group, input.target);
    }
}

export class EditableField
{
    constructor (htmlId, field_path, front, editable, type, data)
    {
        this.html = htmlId instanceof HTMLElement ? htmlId : document.querySelector(htmlId);
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
        let targetReadOnly = toReadOnly == null ? !this.readOnly : toReadOnly;
        if (!this.editable)
            targetReadOnly = true;
        // allow force redraw
        // if (targetReadOnly == this.readOnly) return; // nothing to do
        let content = Utils.getAttr(this.front, this.path) || "...";
        if (targetReadOnly)
        {
            if (commit && this.editable)
            {
                let obj = this.html.querySelector(`input`);
                if (obj && obj.value && obj.value !== "")
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
        Utils.setText(this.html, content);
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
        this.html.innerHTML = ""; // lazy empty
        this.html.appendChild(input);
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