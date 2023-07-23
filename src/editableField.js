import { Utils }  from "./utils";

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
        if (this.type === "number")
        {
            content = parseFloat(content)
        }
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
        let displayed = content;
        if (this.data?.displayCb)
        {
            displayed = this.data.displayCb(content);
        }
        else if (content == null)
        {
            content = "...";
            displayed = content;
        }
        if (targetReadOnly)
        {
            if (commit && this.editable)
            {
                if (this.data && this.data.onPreCommit)
                {
                    this.data.onPreCommit();
                }
                let tmp = this._setValueFromEdit();
                if (tmp != null) content = tmp;
            }
            this._buildReadOnly(content, displayed)
        }
        else
        {
            this._buildEditable(content, displayed);
        }
        this.readOnly = targetReadOnly;
    }

    _buildReadOnly(content, displayed)
    {
        let innerhtml = displayed;
        if (this.type === "combo")
        {
            let cssClasses = this.data.items[content];
            if (cssClasses != null)
            {

                innerhtml = `<div class="d-flex align-items-center gap-2">
                                <div class="badge ${cssClasses} rounded-3 fw-semibold">
                                    <span class="text-${cssClasses}">${displayed}</span>
                                </div>
                            </div>`
            }
        }
        Utils.setText(this.html, innerhtml);
    }

    _buildEditable(content, displayed)
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
        else if (this.type === "combo")
        {
            out = document.createElement("select");
            for (let key of Object.keys(this.data.items))
            {
                let option = document.createElement("option");
                option.setAttribute("value", key);
                let displayed = key;
                if (this.data.displayCb) displayed = this.data.displayCb(key);
                option.innerText = displayed;
                out.appendChild(option);
            }
            out.value = content;
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

    _setValueFromEdit()
    {
        let content;
        let obj;
        if (this.type === "combo")
        {
            obj = this.html.querySelector(`select`);
        }
        else
        {
            obj = this.html.querySelector(`input`);
        }
        if (obj && obj.value && obj.value !== "")
        {
            content = obj.value;
        }
        if (content != null)
            this.setAttr(content);
        return content;

    }

}
