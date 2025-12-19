import * as React from "react"

const Tabs = ({ defaultValue, children, className = "" }) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue)

    return (
        <div className={`w-full ${className}`} data-active-tab={activeTab}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { activeTab, setActiveTab })
                }
                return child
            })}
        </div>
    )
}

const TabsList = ({ children, className = "", activeTab, setActiveTab }) => {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 ${className}`}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { activeTab, setActiveTab })
                }
                return child
            })}
        </div>
    )
}

const TabsTrigger = ({ value, children, className = "", activeTab, setActiveTab }) => {
    const isActive = activeTab === value

    return (
        <button
            type="button"
            onClick={() => setActiveTab(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:bg-white/50"
                } ${className}`}
        >
            {children}
        </button>
    )
}

const TabsContent = ({ value, children, className = "", activeTab }) => {
    if (activeTab !== value) return null

    return (
        <div
            className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${className}`}
        >
            {children}
        </div>
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
