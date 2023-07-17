import { Utils }  from "./basicClasses";

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
