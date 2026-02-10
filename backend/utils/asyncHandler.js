
export const asyncHandler=(fn)=>{
    if(typeof fn!=="function"){
        throw new TypeError("asyncHandler expects a function");
    }
        return async (req,res,next)=>{
            try {
                await fn(req,res,next)
            } catch (error) {
                next(error);
            }
        }
}