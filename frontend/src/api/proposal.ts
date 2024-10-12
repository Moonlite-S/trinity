import AxiosInstance from "../components/Axios";
import { ProposalCreationProps, ProposalProps } from "../interfaces/proposal_types";

export async function getProposalList(): Promise<ProposalProps[]>{
    try{
        const response = await AxiosInstance.get("/api/proposal/")
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function getProposalCreationData(): Promise<ProposalCreationProps>{
    try{
        const response = await AxiosInstance.get("/api/proposal/creation_data/")
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}