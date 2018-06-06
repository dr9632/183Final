// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    function get_posts_url(start_idx, end_idx, thread_id) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx,
            thread_id: thread_id
        };
        return posts_url + "?" + $.param(pp);
    }

    self.get_posts = function (thread_id) {
        self.vue.curr_thread_id = thread_id;
        $.getJSON(get_posts_url(0, 10, thread_id), function (data) {
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.posts);
        });
    };

    self.get_more = function (thread_id) {
        var num_posts = self.vue.posts.length;
        $.getJSON(get_memos_url(num_posts, num_posts + 10, thread_id), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
            enumerate(self.vue.posts);
        });
    };

    function get_threads_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return threads_url + "?" + $.param(pp);
    }

    self.get_threads = function () {
        $.getJSON(get_threads_url(0, 10), function (data) {
            self.vue.threads = data.threads;
            self.vue.thread_has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.threads);
        });
    };

    self.thread_get_more = function () {
        var num_threads = self.vue.threads.length;
        $.getJSON(get_threads_url(num_threads, num_threads + 10), function (data) {
            self.vue.thread_has_more = data.has_more;
            self.extend(self.vue.threads, data.threads);
            enumerate(self.vue.threads);
        });
    };

    self.is_selected = function (id) {
        if (self.vue.curr_thread_id==id)
            return 'background-color: teal;';
    }

    self.add_post_button = function () {
        // The button to add a track has been pressed.
          self.vue.is_adding = true;
    };

    self.add_post = function () {
        $.post(add_post_url,
            {
                content: self.vue.form_content,
                thread_id: self.vue.curr_thread_id
            },
            function (data) {
                $.web2py.enableElement($("#add_post_submit"));
                self.vue.is_adding = !self.vue.is_adding;
                self.vue.posts.unshift(data.post);
                enumerate(self.vue.posts);
                self.vue.form_content = "";
            });
    };

    self.cancel_add_post = function () {
        self.vue.is_adding = false;
        self.vue.form_content = "";
    };

    self.create_thread_button = function () {
        // The button to add a track has been pressed.
          self.vue.is_creating = true;
    };

    self.create_thread = function () {
        $.post(create_thread_url,
            {
                title: self.vue.form_thread_title,
                category: self.vue.form_thread_category
            },
            function (data) {
                $.web2py.enableElement($("#add_thread_submit"));
                self.vue.is_creating = !self.vue.is_creating;
                self.vue.threads.unshift(data.thread);
                enumerate(self.vue.threads);
                self.vue.form_thread_title = "";
                self.vue.form_thread_category = "";
                $.web2py.flash("New story thread created!");
            });
    };

    self.cancel_create_thread = function () {
        self.vue.is_creating = false;
        self.vue.form_thread_title = "";
        self.vue.form_thread_category = "";
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding: false,
            is_creating: false,
            posts: [],
            threads: [],
            logged_in: false,
            has_more: false,
            thread_has_more: false,
            form_content: null,
            form_thread_title: null,
            form_thread_category: null,
            curr_thread_id: -1
        },
        methods: {
            get_post: self.get_posts,
            get_more: self.get_more,
            thread_get_more: self.thread_get_more,
            is_selected: self.is_selected,
            add_post_button: self.add_post_button,
            add_post: self.add_post,
            cancel_add_post: self.cancel_add_post,
            create_thread_button: self.create_thread_button,
            create_thread: self.create_thread,
            cancel_create_thread: self.cancel_create_thread
        }

    });

    //self.get_posts();
    self.get_threads();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
