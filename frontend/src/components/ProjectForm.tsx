import { useEffect, useState } from "react"
import { ProjectFormBaseProps, ProjectProps } from "../interfaces/project_types"
import { getDataForProjectCreation } from "../api/projects"
import { CreateableSelectionComponent, SelectionComponent, BottomFormButton, OrangeButton } from "./Buttons"
import { Error_Component } from "./misc"
import { useAuth } from "../App"
import { useNavigate } from "react-router-dom"
import { useProjectFormHandler } from "../hooks/projectFormHandler"
import { GenericCheckbox, GenericForm, GenericInput, GenericSelect, GenericSlider, GenericTextArea } from "./GenericForm"
import { InvoiceProps } from "../interfaces/invoices_types"
import { getInvoiceByProjectId } from "../api/invoices"

const templates = [
    'default'
]

/**
 * This component shows the user the form to create a new project.
 * 
 * @param FormProps : The ProjectProp object that is used to fill the form (If updating)
 * @param method : The method to use to submit the form (POST or PUT)
 * 
 */
export function ProjectForm(
    {formProps, method}: {formProps?: ProjectProps, method: "POST" | "PUT"}
) { 
    const { user } = useAuth()

    if (!user) {
        return <Error_Component errorString="User not found" />
    }

    const navigate = useNavigate()

    const [currentProjectData, setCurrentProjectData] = useState<ProjectProps>(formProps ?? {
        project_id: "",
        project_name: "",
        status: "ACTIVE",
        start_date: new Date().toLocaleDateString("en-CA"),
        end_date: "",
        manager: user,
        city: "",
        description: "",
        client_name: "",
        template: "default"
    })


    const [ProjectManagers, setProjectManagers] = useState<string[]>([])
    const [Clients, setClients] = useState<{ value: string, label: string }[] | undefined>()
    const [Cities, setCities] = useState<{ value: string, label: string }[] | undefined>()
    const [errorString, setErrorString] = useState<string>()
    const [invoiceData, setInvoiceData] = useState<InvoiceProps>({
        invoice_date: new Date().toLocaleDateString("en-CA"),
        payment_status: "Pending",
        payment_amount: 0,
        project_id: "",
        project_name: ""
    })

    const { onSubmit, onManagerChange, onClientChange, onCityChange, onSendInvoice } = useProjectFormHandler(setCurrentProjectData, currentProjectData, invoiceData, navigate, setErrorString, method)

    const projectManagerListOptions = ProjectManagers?.map((value: string) => {
        return { value: value[1], label: value[0] }
    })

    useEffect(() => {
        const get_project_data = async () => {
            try {
                const response = await getDataForProjectCreation(currentProjectData.start_date)

                if (!response) {
                    throw new Error("Error fetching project list")
                }

                setProjectManagers(response.users)

                const obj_client_names = response.client_names.map((value: string) => {
                    return { value: value, label: value }
                })
                const obj_cities = response.cities.map((value: string) => {
                    return { value: value, label: value }
                })
                
                setClients(obj_client_names)
                setCities(obj_cities)
            } catch (error) {
                console.error("Error fetching project list:", error)
                setErrorString("Error fetching project list: " + error)
            }
        }

        const get_invoice_data = async () => {
            try {
                if (currentProjectData.project_id) {
                    const response = await getInvoiceByProjectId(currentProjectData.project_id)
                    console.log("response", response)
                    setInvoiceData(response)
                }
            } catch (error) {
                console.error("Error fetching invoice data:", error)
            }
        }

        get_invoice_data()
        get_project_data()
    },[])

    return (
    <>
    {errorString && <Error_Component errorString={errorString} />}

    <ProjectFormBase
        currentProjectData={currentProjectData} 
        projectManagerListOptions={projectManagerListOptions} 
        Clients={Clients ?? []} 
        Cities={Cities ?? []} 
        templates={templates} 
        onSubmit={onSubmit} 
        onManagerChange={onManagerChange} 
        onClientChange={onClientChange} 
        onCityChange={onCityChange} 
        method={method}
        onSendInvoice={onSendInvoice}
        invoiceData={invoiceData}
        setInvoiceData={setInvoiceData}
    />
    </>
    )
}

function ProjectFormBase({ 
    currentProjectData,
    projectManagerListOptions, 
    Clients, Cities, templates, 
    onSubmit, onManagerChange, onClientChange, 
    onCityChange, method, onSendInvoice, 
    invoiceData, setInvoiceData
}: ProjectFormBaseProps) {
    const [sendInvoice, setSendInvoice] = useState<boolean>(false)

    const onSendInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSendInvoice(e.target.checked)
    }

    const onInvoiceBillingAmountChange = (value: number) => {
        setInvoiceData({...invoiceData, payment_amount: value})
    }

    return (
        <GenericForm form_id="project_creation" onSubmit={onSubmit}>
            <GenericInput label="Project Name" value={currentProjectData.project_name} type="text" name="project_name"/>
            <div className="grid grid-cols-2 gap-4">
                <GenericInput label="Date Created" value={currentProjectData.start_date} type="date" name="start_date"/>
                <GenericInput label="Date Due" value={currentProjectData.end_date} type="date" name="end_date"/>
            </div> 
            <div className="grid grid-cols-3 gap-4">
                <SelectionComponent label="Project Manager" Value={currentProjectData.manager.name} options={projectManagerListOptions} onChange={onManagerChange} name="manager"/>
                <CreateableSelectionComponent label="Client Name" options={Clients} name="client_name" Value={currentProjectData.client_name} onChange={onClientChange}/>
                <CreateableSelectionComponent label="City" Value={currentProjectData.city} options={Cities} name="city" onChange={onCityChange}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <GenericSelect label="Project Status" value={currentProjectData.status} options={["ACTIVE", "COMPLETED", "CANCELLED", "NOT STARTED"]} name="status" />
                <GenericSelect label="Template" value={currentProjectData.template} options={templates} name="template" />
            </div>
            <GenericTextArea label="Project Description" value={currentProjectData.description} name="description" />

            <GenericCheckbox label="Send Invoice" value={sendInvoice} name="send_invoice" onChange={onSendInvoiceChange}/>
            {sendInvoice && <GenericSlider label="Invoice Billing Amount (%)" value={invoiceData.payment_amount ?? 0} name="invoice_billing_amount" onChange={onInvoiceBillingAmountChange}/>}

            <BottomFormButton button_text={method === "POST" ? "Create Project" : "Update Project"}>
                {sendInvoice && <OrangeButton onClick={onSendInvoice}>Send Invoice</OrangeButton>}
            </BottomFormButton>
        </GenericForm>
    )
}
