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
        if (self.vue.in_rev)
            return posts_rev_url + "?" + $.param(pp);
        else
        return posts_url + "?" + $.param(pp);
    }

    self.get_posts = function (thread_id) {
        if(self.vue.curr_thread_id != thread_id) {
            self.vue.curr_thread_id = thread_id;
            self.vue.in_rev = false;
        }
        self.cancel_create_thread();
        self.vue.is_viewing_user = false;
        self.vue.is_viewing_inbox = false;
        $.getJSON(get_posts_url(0, 10, thread_id), function (data) {
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            self.vue.curr_thread_title = data.thread_title;
            if (data.thread_cate.length > 0)
                self.vue.curr_thread_cate = data.thread_cate.split(",");
            else
                self.vue.curr_thread_cate = [];
            enumerate(self.vue.posts);
        });
    };

    self.asc_get = function () {
        self.vue.in_rev = false;
        self.get_posts(self.vue.curr_thread_id);
    };

    self.dsc_get = function () {
        self.vue.in_rev = true;
        self.get_posts(self.vue.curr_thread_id);
    };

    self.get_more = function (thread_id) {
        var num_posts = self.vue.posts.length;
        $.getJSON(get_posts_url(num_posts, num_posts + 10, thread_id), function (data) {
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
        $.getJSON(get_threads_url(0, 15), function (data) {
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

    function get_user_data_url(start_idx, end_idx, email) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx,
            email: email
        };
        return user_data_url + "?" + $.param(pp);
    }

    self.get_user_data = function (email) {
        self.vue.curr_thread_id = -1;
        self.cancel_create_thread();
        self.vue.is_viewing_user = true;
        self.vue.is_viewing_inbox = false;
        $.getJSON(get_user_data_url(0, 10, email), function (data) {
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.curr_user_name = data.name;
            self.vue.curr_user_email = email;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.posts);
        });
    };

    self.user_get_more = function (email) {
        var num_posts = self.vue.posts.length;
        $.getJSON(get_user_data_url(num_posts, num_posts + 10, email), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
            enumerate(self.vue.posts);
        });
    };

    self.is_selected = function (id) {
        if (self.vue.curr_thread_id==id)
            return 'background-color: teal; color: #fff;';
    };

    self.add_post_button = function () {
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
        self.vue.is_creating = true;
        self.vue.is_viewing_user = false;
        self.vue.is_viewing_inbox = false;
    };

    self.is_cate = function (cate) {
        return self.vue.form_thread_category.includes(cate);
    };

    self.add_cate = function (cate) {
        if (!self.is_cate(cate)) {
            self.vue.form_thread_category.unshift(cate);
            enumerate(self.vue.form_thread_category);
        }
        self.vue.form_thread_temp = "";
    };

    self.rmv_cate = function (cate_idx) {
         self.vue.form_thread_category.splice(cate_idx, 1);
         enumerate(self.vue.form_thread_category);
    };

    self.create_thread = function () {
        $.post(create_thread_url,
            {
                title: self.vue.form_thread_title,
                category: self.vue.form_thread_category.toString()
            },
            function (data) {
                $.web2py.enableElement($("#add_thread_submit"));
                self.vue.is_creating = !self.vue.is_creating;
                self.vue.threads.unshift(data.thread);
                enumerate(self.vue.threads);
                self.vue.form_thread_title = "";
                self.vue.form_thread_category = [];
                self.vue.form_thread_temp = "";
                $.web2py.flash("New story thread created!");
            });
    };

    self.cancel_create_thread = function () {
        self.vue.is_creating = false;
        self.vue.form_thread_title = "";
        self.vue.form_thread_category = [];
        self.vue.form_thread_temp = "";
    };

    function get_check_inbox_url(start_idx, end_idx, email) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx,
            email: email
        };
        return check_inbox_url + "?" + $.param(pp);
    }

    self.check_inbox = function (email) {
        if(email != null) {
        $.getJSON(get_check_inbox_url(0, 10, email), function (data) {
            self.vue.new_msg = data.new_msg;
            self.vue.msgs = data.msgs;
            self.vue.inbox_has_more = data.has_more;
        });}
    };

    function get_update_inbox_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx,
            email: auth_user
        };
        return update_inbox_url + "?" + $.param(pp);
    }

    self.print_inbox = function () {
        self.cancel_create_thread();
        self.vue.is_viewing_user = false;
        self.vue.is_viewing_inbox = true;
        $.post(get_update_inbox_url(0, 10),
            function (data) {
                self.vue.new_msg = data.new_msg;
                enumerate(self.vue.msgs);
            });
    };

    self.inbox_get_more = function (email) {
        var num_posts = self.vue.msgs.length;
        $.getJSON(get_check_inbox_url(num_posts, num_posts + 10, email), function (data) {
            self.vue.inbox_has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
            enumerate(self.vue.posts);
        });
    };

    self.send_msg_button = function () {
        // The button to add a track has been pressed.
          self.vue.is_sending = true;
    };

    self.send_msg = function (email) {
        $.post(send_msg_url,
            {
                msg: self.vue.form_msg,
                sent_to: email
            },
            function (data) {
                $.web2py.enableElement($("#send_msg_submit"));
                self.vue.is_sending = !self.vue.is_sending;
                self.vue.form_msg = "";
                $.web2py.flash("Message sent");
            });
    };

    self.cancel_send_msg = function () {
        self.vue.is_sending = false;
        self.vue.form_msg = "";
    };

    function get_search_url(key) {
        var pp = {
            key: key
        };
        return search_url + "?" + $.param(pp);
    }

    self.search = function (key) {
        $.getJSON(get_search_url(key), function (data) {
            self.vue.threads = data.threads;
            self.vue.thread_has_more = false;
            enumerate(self.vue.threads);
            self.vue.form_search = "";
        });
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding: false,
            is_creating: false,
            is_viewing_user: false,
            is_viewing_inbox: false,
            is_sending: false,
            posts: [],
            threads: [],
            masgs: [],
            logged_in: false,
            has_more: false,
            in_rev: false,
            thread_has_more: false,
            inbox_has_more: false,
            new_msg: false,
            form_content: null,
            form_thread_title: null,
            form_thread_category: [],
            form_thread_temp: "",
            form_msg: "",
            form_search: "",
            curr_thread_id: -1,
            curr_thread_title: "",
            curr_thread_cate: [],
            curr_user_name: "",
            curr_user_email: ""
        },
        methods: {
            get_posts: self.get_posts,
            get_more: self.get_more,
            asc_get: self.asc_get,
            dsc_get: self.dsc_get,
            thread_get_more: self.thread_get_more,
            get_user_data: self.get_user_data,
            user_get_more: self.user_get_more,
            is_selected: self.is_selected,
            add_post_button: self.add_post_button,
            add_post: self.add_post,
            cancel_add_post: self.cancel_add_post,
            create_thread_button: self.create_thread_button,
            is_cate: self.is_cate,
            add_cate: self.add_cate,
            rmv_cate: self.rmv_cate,
            create_thread: self.create_thread,
            cancel_create_thread: self.cancel_create_thread,
            print_inbox: self.print_inbox,
            inbox_get_more: self.inbox_get_more,
            send_msg_button: self.send_msg_button,
            send_msg: self.send_msg,
            cancel_send_msg: self.cancel_send_msg,
            search: self.search
        }

    });

    self.get_threads();
    self.check_inbox(auth_user);
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
