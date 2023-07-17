
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
        this.name = input.name;
        this.firstname = input.firstname;
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

export class EditableField
{
    constructor (readOnly, htmlId, field_path, front, editable, type, data)
    {
        this.html = htmlId instanceof HTMLElement ? htmlId : document.querySelector(htmlId);
        this.path = field_path.split(".");
        this.front = front;
        this.editable = editable;
        this.type = type;
        this.readOnly = readOnly;
        this.data = data;
        this.toggle(this.readOnly);
    }
    getAttr()
    {
        try
        {
            return Utils.getAttr(this.front, this.path);
        }
        catch(e)
        {
            if (this.data && this.data.canFail)
            {
                return undefined;
            }
            throw e;
        }
    }

    setAttr(content)
    {
        try
        {
            Utils.setAttr(this.front, this.path, content);
        }
        catch(e)
        {
            if (!this.data || !this.data.canFail)
            {
                throw e;
            }
        }
    }

    toggle(toReadOnly, commit)
    {
        let targetReadOnly = toReadOnly == null ? !this.readOnly : toReadOnly;
        if (!this.editable)
            targetReadOnly = true;
        // allow force redraw
        // if (targetReadOnly == this.readOnly) return; // nothing to do
        let content = this.getAttr();
        if (content == null) content = "...";
        if (targetReadOnly)
        {
            if (commit && this.editable)
            {
                if (this.data && this.data.onPreCommit)
                {
                    this.data.onPreCommit();
                }
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
        let out;
        if (this.type === "icon")
        {
            out = document.createElement("div");
            out.innerHTML = `<a class="text-white bg-danger rounded-circle p-2 d-flex align-items-center justify-content-center" href="javascript:void(0)">
              <i class="${this.data.iconName} fs-6"></i>
            </a>`;
            out.addEventListener("click", this.data.onClick);
        }
        else
        {

            let input = document.createElement("input");
            input.setAttribute("type", this.type);
            input.setAttribute("placeholder", content);
            if (this.type === "date")
            {
                input.value = content;
            }
            out = input;
        }
        this.html.innerHTML = ""; // lazy empty
        this.html.appendChild(out);
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