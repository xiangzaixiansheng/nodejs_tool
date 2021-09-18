/**
 * @description 获取10位时间戳
 * @returns 
 */
 export const getCurTimeStamp = () => {
    return Math.round(new Date().getTime() / 1000);
}
/**
 * @description 获取n天前的10位时间戳
 * @param days 
 */
export const getBeforeDaysTmp = (days: number = 2) => {
    return Math.round((new Date().getTime() - 24 * 60 * 60 * 1000 * days) / 1000);
}