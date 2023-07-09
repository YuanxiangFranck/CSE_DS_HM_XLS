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

export class Utils
{
    static applyRule(group, sum, rules, nb_p=0)
    {
        const rule = rules[group];
        if (rule == null) return sum;

    }
}