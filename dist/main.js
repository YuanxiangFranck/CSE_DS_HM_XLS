/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/clientServerManager.js":
/*!************************************!*\
  !*** ./src/clientServerManager.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ClientServerManager: () => (/* binding */ ClientServerManager)\n/* harmony export */ });\n\n\nclass ClientServerManager\n{\n    constructor(useServer = false)\n    {\n        this._useServer = useServer;\n    }\n\n    async fetchSavedContent()\n    {\n        if (this._useServer) throw new Error(\"To implement\");\n        let content = localStorage.getItem(\"ce_dassault_sport_compte_local\");\n        if (content == null)\n            return {};\n        try\n        {\n            return JSON.parse(content)\n        }\n        catch(e)\n        {\n            console.error(e);\n        }\n        console.log(\"fetch\", content);\n        return content;\n    }\n\n    async saveContent(content)\n    {\n        if (this._useServer) throw new Error(\"To implement\");\n        console.log(\"push\", content);\n        localStorage.setItem(\"ce_dassault_sport_compte_local\", content.toJson());\n    }\n\n    async clear()\n    {\n        localStorage.removeItem(\"ce_dassault_sport_compte_local\");\n    }\n};\n\n//# sourceURL=webpack://cse_ds_hm_xls/./src/clientServerManager.js?");

/***/ }),

/***/ "./src/dataModel.js":
/*!**************************!*\
  !*** ./src/dataModel.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CompanyEnum: () => (/* binding */ CompanyEnum),\n/* harmony export */   Data: () => (/* binding */ Data),\n/* harmony export */   Expense: () => (/* binding */ Expense),\n/* harmony export */   GroupsEnum: () => (/* binding */ GroupsEnum),\n/* harmony export */   Info: () => (/* binding */ Info),\n/* harmony export */   User: () => (/* binding */ User)\n/* harmony export */ });\n\n\nlet STATIC_USER_COUNT = 1;\nlet STATIC_EXPENSE_COUNT = 0;\n\nconst GroupsEnum = {\n    Guide: \"Guide\",\n    Location: \"Location\",\n    Logement: \"Logement\",\n    Transport: \"Transport\",\n    Misc: \"Misc\"\n};\n\nconst DEFAULT_GROUPS = Object.values(GroupsEnum);\n\nconst DEFAULT_RULES = {\n    \"Guide\" : { ratio: 0.6 },\n    \"Location\" : { ratio: 0.5 },\n    \"Transport\" : { ratio: 0.5 },\n    \"Logement\" : { ratio: 0.5,  maxi_pp: 50 }\n};\nconst CompanyEnum = {\n    DS: \"DS\",\n    DSExt: \"DS (Ext)\",\n    DA: \"DA\",\n    DAExt: \"DA (Ext)\"\n};\nconst DEFAULT_SUPER_USER = {\n    firstname: \"Dassault\", name: \"Sport\",\n    company: CompanyEnum.DA, isSuperUser : true\n};\n\nclass BaseJson\n{\n    constructor(){}\n    toJson()\n    {\n        let tmp = {};\n        for (let [k,v] of Object.entries(this))\n        {\n            if (k.startsWith(\"_\")) continue;\n            tmp[k] = v;\n        }\n        return tmp;\n    }\n}\n\nclass Info extends BaseJson\n{\n    constructor(input)\n    {\n        super();\n        this.title = input?.title || \"-Nom de la sortie-\";\n        this.destination = input?.destination || \"X\";\n        this.type = input?.type || \"X\";\n        this.start = input?.start || \"DD-MM-YYYY\";\n        this.end = input?.end || \"DD-MM-YYYY\";\n        this.responsible = input?.responsible || \"X\";\n    }\n}\n\nclass User extends BaseJson\n{\n    constructor (input)\n    {\n        super();\n        if (typeof input == \"string\")\n        {\n            input = JSON.parse(input);\n        }\n        this.company = input.company || CompanyEnum.DS;\n        this.isSuperUser = input.isSuperUser || false;\n        let id;\n        if (this.isSuperUser)\n        {\n            id = 0;\n        }\n        else if (input.id != null)\n        {\n            STATIC_USER_COUNT = Math.max(STATIC_USER_COUNT, input.id);\n            id = input.id;\n        }\n        else\n            id = ++STATIC_USER_COUNT;\n\n        this.id = id;\n        this.name = input.name || `${this.id}`;\n        this.firstname = input.firstname || `User`;\n        this._toPay = 0;\n    }\n\n    get fullname()\n    {\n        return `${this.firstname} ${this.name}`;\n    }\n    get shortname()\n    {\n        return `${this.firstname} ${this.name[0]}.`;\n    }\n    get alias()\n    {\n        return `${this.firstname[0]}${this.name[0]}`;\n    }\n}\n\nclass Expense extends BaseJson\n{\n    constructor (input)\n    {\n        super();\n        this.when = input?.when || \"DD-MM-YYYY\";\n        this.from = input?.from || 0;\n        this.what = input?.what || \"-\";\n        this.cost = input?.cost || 0;\n        this.group = input?.group || GroupsEnum.Misc;\n        this.target = input?.target || \"All\"; // undefined means all\n        let id;\n        this._sub = 0;\n        if (input.id != null)\n        {\n            STATIC_EXPENSE_COUNT = Math.max(STATIC_EXPENSE_COUNT, input.id);\n            id = input.id;\n        }\n        else\n            id = ++STATIC_EXPENSE_COUNT;\n        this.id = id;\n    }\n\n}\n\nclass Data extends BaseJson\n{\n    constructor(input)\n    {\n        super();\n        this.info = new Info(input?.info);\n        this.users = {};\n        let hasSuper = false;\n        for (let u of Object.values(input?.users || {}))\n        {\n            let user = new User(u);\n            if (!user || user.id == null) continue;\n            this.users[user.id] = user;\n            hasSuper |= user.isSuperUser;\n        }\n        if (!hasSuper)\n        {\n            let user = new User(DEFAULT_SUPER_USER)\n            this.users[user.id] = user;\n        }\n        this.expenses = {};\n        for (let e of Object.values(input?.expenses || {}))\n        {\n            let exp = new Expense(e);\n            if (!exp || exp.id == null) continue;\n            this.expenses[exp.id] = exp;\n        }\n        this.groups = input?.groups || DEFAULT_GROUPS;\n        this.rules = input?.rules || DEFAULT_RULES;\n    }\n\n    toJson()\n    {\n        return JSON.stringify(this);\n    }\n}\n\n\n//# sourceURL=webpack://cse_ds_hm_xls/./src/dataModel.js?");

/***/ }),

/***/ "./src/editableField.js":
/*!******************************!*\
  !*** ./src/editableField.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   EditableField: () => (/* binding */ EditableField)\n/* harmony export */ });\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./src/utils.js\");\n\n\nclass EditableField\n{\n    constructor (readOnly, htmlId, field_path, front, editable, type, data)\n    {\n        this.html = htmlId instanceof HTMLElement ? htmlId : document.querySelector(htmlId);\n        this.path = field_path.split(\".\");\n        this.front = front;\n        this.editable = editable;\n        this.type = type;\n        this.readOnly = readOnly;\n        this.data = data;\n        this.toggle(this.readOnly);\n    }\n    getAttr()\n    {\n        try\n        {\n            return _utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getAttr(this.front, this.path);\n        }\n        catch(e)\n        {\n            if (this.data && this.data.canFail)\n            {\n                return undefined;\n            }\n            throw e;\n        }\n    }\n\n    setAttr(content)\n    {\n        if (this.type === \"number\")\n        {\n            content = parseFloat(content)\n        }\n        try\n        {\n            _utils__WEBPACK_IMPORTED_MODULE_0__.Utils.setAttr(this.front, this.path, content);\n        }\n        catch(e)\n        {\n            if (!this.data || !this.data.canFail)\n            {\n                throw e;\n            }\n        }\n    }\n\n    toggle(toReadOnly, commit)\n    {\n        let targetReadOnly = toReadOnly == null ? !this.readOnly : toReadOnly;\n        if (!this.editable)\n            targetReadOnly = true;\n        // allow force redraw\n        // if (targetReadOnly == this.readOnly) return; // nothing to do\n        let content = this.getAttr();\n        let displayed = content;\n        if (this.data?.displayCb)\n        {\n            displayed = this.data.displayCb(content);\n        }\n        else if (content == null)\n        {\n            content = \"...\";\n            displayed = content;\n        }\n        if (targetReadOnly)\n        {\n            if (commit && this.editable)\n            {\n                if (this.data && this.data.onPreCommit)\n                {\n                    this.data.onPreCommit();\n                }\n                let tmp = this._setValueFromEdit();\n                if (tmp != null)\n                {\n                    content = tmp;\n                    displayed = content;\n                    if (this?.data?.displayCb) displayed = this.data.displayCb(content);\n                }\n            }\n            this._buildReadOnly(content, displayed)\n        }\n        else\n        {\n            this._buildEditable(content, displayed);\n        }\n        this.readOnly = targetReadOnly;\n    }\n\n    _buildReadOnly(content, displayed)\n    {\n        let innerhtml = displayed;\n        if (this.type === \"combo\")\n        {\n            let cssClasses = this.data.items[displayed];\n            if (cssClasses != null)\n            {\n\n                innerhtml = `<div class=\"d-flex align-items-center gap-2\">\n                <div class=\"badge ${cssClasses} rounded-3 fw-semibold\">\n                <span class=\"text-${cssClasses}\">${displayed}</span>\n                </div>\n                </div>`\n            }\n        }\n        _utils__WEBPACK_IMPORTED_MODULE_0__.Utils.setText(this.html, innerhtml);\n    }\n\n    _buildEditable(content, displayed)\n    {\n        let out;\n        if (this.type === \"icon\")\n        {\n            out = document.createElement(\"div\");\n            out.innerHTML = `<a class=\"text-white bg-danger rounded-circle p-2 d-flex align-items-center justify-content-center\" href=\"javascript:void(0)\">\n              <i class=\"${this.data.iconName} fs-6\"></i>\n            </a>`;\n            out.addEventListener(\"click\", this.data.onClick);\n        }\n        else if (this.type === \"combo\")\n        {\n            out = document.createElement(\"select\");\n            if (this.data.multiple)\n                out.setAttribute(\"multiple\", \"\");\n            // need to be sed before changing options\n            out.value = content;\n            for (let key of Object.keys(this.data.items))\n            {\n                let option = document.createElement(\"option\");\n                option.setAttribute(\"value\", key);\n                let displayed = key;\n                if (this.data.displayCb) displayed = this.data.displayCb(key);\n                option.innerText = displayed;\n                out.appendChild(option);\n                if (this.data.multiple)\n                {\n                    if (Array.isArray(content) && content.includes(key))\n                    {\n                        // option.setAttribute(\"selected\", \"\");\n                        option.selected = true;\n                    }\n                }\n            }\n        }\n        else\n        {\n\n            let input = document.createElement(\"input\");\n            input.setAttribute(\"type\", this.type);\n            input.setAttribute(\"placeholder\", content);\n            if (this.type === \"date\")\n            {\n                input.value = content;\n            }\n            out = input;\n        }\n        this.html.innerHTML = \"\"; // lazy empty\n        this.html.appendChild(out);\n    }\n\n    _setValueFromEdit()\n    {\n        let content;\n        let obj;\n        if (this.type === \"combo\")\n        {\n            obj = this.html.querySelector(`select`);\n            if (obj)\n            {\n                if (this.data.multiple)\n                {\n                    content = [];\n                    for (let opt of obj.options)\n                    {\n                        if (opt.selected)\n                        {\n                            content.push(opt.value);\n                        }\n                    }\n                }\n                else\n                {\n                    content = obj.value;\n                }\n            }\n        }\n        else\n        {\n            obj = this.html.querySelector(`input`);\n            if (obj && obj.value != \"\")\n                content = obj.value;\n        }\n        if (content != null)\n            this.setAttr(content);\n        return content;\n\n    }\n\n}\n\n\n//# sourceURL=webpack://cse_ds_hm_xls/./src/editableField.js?");

/***/ }),

/***/ "./src/front.js":
/*!**********************!*\
  !*** ./src/front.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   FrontPage: () => (/* binding */ FrontPage)\n/* harmony export */ });\n/* harmony import */ var _clientServerManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./clientServerManager */ \"./src/clientServerManager.js\");\n/* harmony import */ var _editableField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./editableField */ \"./src/editableField.js\");\n/* harmony import */ var _dataModel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dataModel */ \"./src/dataModel.js\");\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ \"./src/utils.js\");\n\n\n\n\n\n\"use strict\";\n\nconst EditionModeEnum = {\n    Editable: 0x01,\n    ReadOnly: 0x10,\n}\nconst EditionStateEum = {\n    StartEdit: 0x001,\n    Commit: 0x010,\n    Abort: 0x110\n};\n\nconst CompanyEnumColor = Object.fromEntries([\n    [_dataModel__WEBPACK_IMPORTED_MODULE_2__.CompanyEnum.DS, \"bg-primary\"],\n    [_dataModel__WEBPACK_IMPORTED_MODULE_2__.CompanyEnum.DSExt, \"bg-primary\"],\n    [_dataModel__WEBPACK_IMPORTED_MODULE_2__.CompanyEnum.DA, \"bg-secondary\"],\n    [_dataModel__WEBPACK_IMPORTED_MODULE_2__.CompanyEnum.DAExt, \"bg-secondary\"]\n]);\n\nconst GroupsEnumColor = Object.fromEntries([\n    [_dataModel__WEBPACK_IMPORTED_MODULE_2__.GroupsEnum.Guide, \"bg-primary\"],\n    [_dataModel__WEBPACK_IMPORTED_MODULE_2__.GroupsEnum.Location, \"bg-secondary\"],\n    [_dataModel__WEBPACK_IMPORTED_MODULE_2__.GroupsEnum.Transport, \"bg-success\"],\n    [_dataModel__WEBPACK_IMPORTED_MODULE_2__.GroupsEnum.Logement, \"bg-warning\"],\n    [_dataModel__WEBPACK_IMPORTED_MODULE_2__.GroupsEnum.Misc, \"bg-dark\"]\n]);\n\nclass FrontPage\n{\n    constructor(clientServerManager, content)\n    {\n        this.manager = clientServerManager;\n        // Computed members\n        this._users = {};\n        this._nb_users = 0;\n        this._totalCost = 0;\n        this._totalSub = 0;\n        this._byPerson = {};\n        this._byGroup = {};\n\n        // UI\n        this.infoEditableFields = {};\n        this.usersEditableFields = {};\n        this.expensesEditableFields = {};\n\n        // Init\n        this.state = EditionModeEnum.ReadOnly;\n        // for import export\n        try\n        {\n            this._data = new _dataModel__WEBPACK_IMPORTED_MODULE_2__.Data(content);\n        }\n        catch(e)\n        {\n            console.error(e);\n            console.warn(\"Issues in the data form cache.... clear data for now\")\n            this._data = new _dataModel__WEBPACK_IMPORTED_MODULE_2__.Data({});\n        }\n        // compute values\n        this.preProcessing();\n    }\n    get readOnly()\n    {\n        return this.state & EditionModeEnum.ReadOnly;\n    }\n    /**\n     * preProcessing values from data\n     */\n    preProcessing()\n    {\n        this._nb_users = 0;\n        this._byGroup = {};\n        this._totalCost = 0;\n        this._totalSub = 0;\n        let nonSuperUsers = [];\n\n        for (const user of Object.values(this._data.users))\n        {\n            if (user.isSuperUser) continue;\n            this._nb_users++;\n            nonSuperUsers.push(user.id);\n            user._toPay = 0;\n        }\n        for (let exp of Object.values(this._data.expenses))\n        {\n            // person\n            let targetUsersIds = exp.target;\n            let sub = this.applyRule(exp.group, exp.cost);\n            if (targetUsersIds.includes(\"All\")) targetUsersIds = nonSuperUsers;\n            for (let userId of targetUsersIds)\n            {\n                this._data.users[userId]._toPay -= (exp.cost - sub) / targetUsersIds.length;\n            }\n            // group\n            if (this._byGroup[exp.group] == null)\n                this._byGroup[exp.group] = { cost: 0, sub: 0};\n            this._byGroup[exp.group].cost += exp.cost;\n            this._totalCost += exp.cost;\n            this._byGroup[exp.group].cost += sub;\n            this._totalSub += sub;\n        }\n    }\n    pushData(compute=true)\n    {\n        if (compute)\n            this.preProcessing();\n        this.manager.saveContent(this._data);\n    }\n\n    applyRule(group, sum)\n    {\n        const rule = this._data.rules[group];\n        if (rule == null) return 0;\n        let sub = 0;\n        if (rule.ratio)\n        {\n            sub = sum*rule.ratio;\n        }\n        if (rule.maxi_pp)\n        {\n            sub = Math.min(sub, self.users)\n        }\n        return sub;\n    }\n\n    switchToEdit(mode, push=true)\n    {\n        const readOnly = mode&EditionModeEnum.ReadOnly;\n        const isCancel = mode == EditionStateEum.Abort;\n        const isCommit = mode == EditionStateEum.Commit;\n        // update nav bag\n        _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.toggleVisible(\"#info-edit-commit\", !readOnly);\n        _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.toggleVisible(\"#info-edit-cancel\", !readOnly);\n        _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.toggleVisible(\"#info-edit-start\", readOnly);\n        _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.toggleVisible(\"#user-edit-add\", !readOnly);\n        _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.toggleVisible(\"#expenses-edit-add\", !readOnly);\n        // Update info\n        this.state = mode;\n        if (!readOnly)\n        {\n            // start edit backup for abort\n            this._dataOld = this._data;\n            this._data = new _dataModel__WEBPACK_IMPORTED_MODULE_2__.Data(this._data);\n        }\n        else\n        {\n            if (isCancel)\n                this._data = this._dataOld;\n            this._dataOld = undefined;\n        }\n        for (let toLoop of Object.values(this.expensesEditableFields))\n        {\n            for (let obj of toLoop)\n                obj.toggle(readOnly, isCommit);\n        }\n        for (let toLoop of Object.values(this.usersEditableFields))\n        {\n            for (let obj of toLoop)\n                obj.toggle(readOnly, isCommit);\n        }\n        if (readOnly)\n            this.preProcessing();\n        for (let toLoop of Object.values(this.usersEditableFields))\n        {\n            toLoop[4].toggle(readOnly)\n        }\n        for (let obj of Object.values(this.infoEditableFields))\n        {\n            obj.toggle(readOnly, isCommit);\n        }\n        this.buildSummary();\n        if (readOnly && push)\n            this.pushData(false);\n\n    }\n\n\n    addEventListener()\n    {\n        // build event listeners\n        document.getElementById(\"info-edit-start\").addEventListener(\"click\", this.switchToEdit.bind(this, EditionStateEum.StartEdit));\n        document.getElementById(\"info-edit-commit\").addEventListener(\"click\", this.switchToEdit.bind(this, EditionStateEum.Commit));\n        document.getElementById(\"info-edit-cancel\").addEventListener(\"click\", this.switchToEdit.bind(this, EditionStateEum.Abort));\n        document.getElementById(\"user-edit-add\").addEventListener(\"click\", this.addRowUser.bind(this, undefined));\n        document.getElementById(\"expenses-edit-add\").addEventListener(\"click\", this.addRowExpense.bind(this, undefined));\n    }\n\n    buildInfo()\n    {\n        for (const [id, path, editable, type] of [\n            [\"#info-title\", \"_data.info.title\", true, \"text\"],\n            [\"#info-where\", \"_data.info.destination\", true, \"text\"],\n            [\"#info-type\", \"_data.info.type\", true, \"text\"],\n            [\"#info-start-date\", \"_data.info.start\", true, \"date\"],\n            [\"#info-end-date\", \"_data.info.end\", true, \"date\"],\n            [\"#info-resp\", \"_data.info.responsible\", true, \"text\"],\n            [\"#info-nb-users\", \"_nb_users\", false, \"text\"]\n        ])\n        {\n            this.infoEditableFields[id] = new _editableField__WEBPACK_IMPORTED_MODULE_1__.EditableField(this.readOnly, id, path, this, editable, type);\n        }\n    }\n\n    buildSummary()\n    {\n        _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.setText(\"#info-spent\", this._totalCost);\n        _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.setText(\"#info-sub\", this._totalSub);\n        let val = this._nb_users ? (this._totalCost - this._totalSub) / this._nb_users : 0;\n        val = Math.round(val*100) / 100;\n        _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.setText(\"#info-avg\", val);\n    }\n\n    buildUsers()\n    {\n        let tbody = document.querySelector(\"#users-table tbody\")\n        tbody.innerHTML = \"\";\n        for (let idx of Object.keys(this._data.users))\n        {\n            this.addRowUser(idx);\n        }\n    }\n\n    addRowUser(idx)\n    {\n        let user;\n        if (idx == null)\n        {\n            user = new _dataModel__WEBPACK_IMPORTED_MODULE_2__.User({});\n            idx = user.id;\n            this._data.users[idx] =user;\n        }\n        else\n        {\n            user = this._data.users[idx];\n        }\n        let tbody = document.querySelector(\"#users-table tbody\");\n        let tr = document.createElement(\"tr\");\n        let fields = [];\n        // action\n        for (let [key, editable, type, data] of [\n            [\"id\", true, \"icon\", {\n                iconName:\"ti ti-trash\" ,\n                onClick : ()=>this.removeUser(idx),\n                canFail: true\n            }],\n            [\"firstname\", true, \"text\", {canFail: true}],\n            [\"name\", true, \"text\", {canFail: true}],\n            [\"company\", true, \"combo\", { items : CompanyEnumColor, canFail: true}],\n            [\"_toPay\", false, \"number\", {canFail: true, displayCb: _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.toMoney}],\n        ])\n        {\n            let td = document.createElement(\"td\");\n            td.className = \"boder-bottom-0\";\n            let field = new _editableField__WEBPACK_IMPORTED_MODULE_1__.EditableField(this.readOnly, td, `_data.users.${idx}.${key}`, this, editable && !user.isSuperUser, type, data);\n            tr.appendChild(td);\n            fields.push(field);\n        }\n        this.usersEditableFields[`user_${idx}`] = fields;\n        tbody.appendChild(tr);\n    }\n\n    removeUser(idx)\n    {\n        delete this._data.users[idx];\n        let editables = this.usersEditableFields[`user_${idx}`];\n        let first = editables[0];\n        let torm = first.html.parentElement;\n        torm.parentElement.removeChild(torm);\n    }\n\n    buildExpenses()\n    {\n        let tbody = document.querySelector(\"#expenses-table tbody\")\n        tbody.innerHTML = \"\";\n        for (let idx of Object.keys(this._data.expenses))\n        {\n            this.addRowExpense(idx);\n        }\n    }\n    addRowExpense(idx)\n    {\n\n        let exp;\n        if (idx == null)\n        {\n            exp = new _dataModel__WEBPACK_IMPORTED_MODULE_2__.Expense({});\n            idx = exp.id;\n            this._data.expenses[idx] = exp;\n        }\n        else\n        {\n            exp = this._data.expenses[idx];\n        }\n        let tbody = document.querySelector(\"#expenses-table tbody\");\n        let tr = document.createElement(\"tr\");\n        let fields = [];\n        let usersFrom = {};\n        let usersTo= { \"All\" : \"badge bg-primary\"};\n        for (let user of Object.values(this._data.users))\n        {\n            usersFrom[user.id] = null; // mandatory\n            if (user.isSuperUser) continue;\n            usersTo[user.id] = null; // mandatory\n        }\n        // action\n        for (let [key, type, data] of [\n            [\"id\", \"icon\", {\n                iconName:\"ti ti-trash\" ,\n                onClick : ()=>this.removeExpense(idx),\n                canFail: true\n            }],\n            [\"when\", \"date\", {canFail: true}],\n            [\"what\", \"text\", {canFail: true}],\n            [\"cost\", \"number\", {canFail: true, displayCb: _utils__WEBPACK_IMPORTED_MODULE_3__.Utils.toMoney}],\n            [\"group\", \"combo\", { items : GroupsEnumColor, canFail: true}],\n            [\"from\", \"combo\", {\n                items : usersFrom, canFail: true,\n                displayCb: (idx)=>this._data.users[idx].fullname\n            }],\n            [\"target\",  \"combo\", {\n                items: usersTo, canFail: true,\n                multiple: true,\n                displayCb: (idx)=>{\n                    if (idx === \"All\" || idx?.includes(\"All\")) return \"Tous\";\n                    if (Array.isArray(idx))\n                    {\n                        return idx.map(x=>this._data.users[x].alias).join(\", \")\n                    }\n                    return this._data.users[idx].alias;\n                }\n            }],\n        ])\n        {\n            let td = document.createElement(\"td\");\n            td.className = \"boder-bottom-0\";\n            let field = new _editableField__WEBPACK_IMPORTED_MODULE_1__.EditableField(this.readOnly, td, `_data.expenses.${idx}.${key}`, this, true, type, data);\n            tr.appendChild(td);\n            fields.push(field);\n        }\n        this.expensesEditableFields[idx] = fields;\n        tbody.appendChild(tr);\n    \n    }\n    removeExpense(idx)\n    {\n\n    }\n\n    static async main()\n    {\n        let manager = new _clientServerManager__WEBPACK_IMPORTED_MODULE_0__.ClientServerManager();\n        let content = await manager.fetchSavedContent();\n        let front = new FrontPage(manager, content);\n        console.log(front)\n        window.front = front;\n\n        front.buildInfo();\n        front.buildSummary();\n        front.buildUsers();\n        front.buildExpenses();\n        front.addEventListener();\n        front.switchToEdit(EditionStateEum.Commit, false);\n    }\n}\n\n\n//# sourceURL=webpack://cse_ds_hm_xls/./src/front.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _front__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./front */ \"./src/front.js\");\n\n\n_front__WEBPACK_IMPORTED_MODULE_0__.FrontPage.main();\n\n//# sourceURL=webpack://cse_ds_hm_xls/./src/index.js?");

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Utils: () => (/* binding */ Utils)\n/* harmony export */ });\n\nclass Utils\n{\n    static applyRule(group, sum, rules, nb_p=0)\n    {\n        const rule = rules[group];\n        if (rule == null) return sum;\n\n    }\n\n    static getElems(id)\n    {\n        let out = id  instanceof HTMLElement ? [id ] : document.querySelectorAll(id);\n        if (out.length === 0) throw new Error(\"Empty selection\");\n        return out;\n    }\n    static setText(id, content)\n    {\n        for (let elem of Utils.getElems(id))\n            elem.innerHTML = content;\n    }\n\n    static toggleVisible(id, visible)\n    {\n        for (let elem of Utils.getElems(id))\n            elem.style.display = visible ? \"flex\" : \"none\";\n    }\n\n    static setAttr(obj, path, val)\n    {\n        let tmp = obj;\n        for (let i=0;i<path.length;i++)\n        {\n            if (i===path.length-1)\n            {\n                tmp[path[i]] = val;\n            }\n            tmp = tmp[path[i]];\n        }\n    }\n    static getAttr(obj, path)\n    {\n        let tmp = obj;\n        for (let i=0;i<path.length;i++)\n        {\n            if (i===path.length-1)\n            {\n                return tmp[path[i]];\n            }\n            tmp = tmp[path[i]];\n        }\n        return undefined;\n    }\n\n    static toMoney(num)\n    {\n        let tmp = Math.round(num*100) / 100;\n        return `${tmp} €`;\n    }\n\n}\n\n//# sourceURL=webpack://cse_ds_hm_xls/./src/utils.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;