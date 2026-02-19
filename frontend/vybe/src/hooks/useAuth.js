import { useQueryClient } from "@tanstack/react-query"

export const useCurrentUser=()=>{
    const queryClient=useQueryClient();
    return {
        data:queryClient.getQueryData(["currentUser"])
    }
}