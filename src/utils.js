
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

    static toMoney(num)
    {
        let tmp = Math.round(num*100) / 100;
        return `${tmp} €`;
    }

}