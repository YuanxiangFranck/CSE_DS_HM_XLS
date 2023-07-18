"use strict";

export class ClientServerManager
{
    constructor(useServer = false)
    {
        this._useServer = useServer;
    }

    async fetchSavedContent()
    {
        if (this._useServer) throw new Error("To implement");
        let content = localStorage.getItem("ce_dassault_sport_compte_local");
        if (content == null)
            return {};
        try
        {
            return JSON.parse(content)
        }
        catch(e)
        {
            console.error(e);
        }
        console.log("fetch", content);
        return content;
    }

    async saveContent(content)
    {
        if (this._useServer) throw new Error("To implement");
        console.log("push", content);
        localStorage.setItem("ce_dassault_sport_compte_local", JSON.stringify(content));
    }

    async clear()
    {
        localStorage.removeItem("ce_dassault_sport_compte_local");
    }
};