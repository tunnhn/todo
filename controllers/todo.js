exports = module.exports = {
    getData: async function (req, res) {
        async function getData() {
            let groups = await todoGroupModel.find().exec(),
                items = await todoItemModel.find().exec();

            return {
                groups: groups,
                items: items
            }
        }

        let data = await getData();
        res.send(data)
    }
}