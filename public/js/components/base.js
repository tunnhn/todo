
Todo.baseMethods = {
    $: function (selector) {
        return selector ? $(this.$el).find(selector) : $(this.$el);
    }
}