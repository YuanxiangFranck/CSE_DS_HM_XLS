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
        if (content == null) content = {};
        try
        {
            return JSON.parse(content)
        }
        catch(e)
        {
            console.error(e);
        }
        return content;
    }

    async saveContent(content)
    {
        if (this._useServer) throw new Error("To implement");
        localStorage.setItem("ce_dassault_sport_compte_local", JSON.stringify(content));
    }
};