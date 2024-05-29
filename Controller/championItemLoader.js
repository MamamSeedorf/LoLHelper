// Function that finds a given item using a given item ID.
async function findItemById(itemId){
    var itemList = await loadItemData();
    let targetItemId = itemId;
    let targetItem = itemList.find(item => item["Id"] == targetItemId);
    if (targetItem) {  
        return targetItem; 
    }
    return null;
}


