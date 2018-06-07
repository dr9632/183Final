# Here go your api methods.


def get_posts():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    thread_id = int(request.vars.thread_id) if request.vars.thread_id is not None else 0
    posts = []
    has_more = False
    rows = db(db.post.thread_id == thread_id).select(db.post.ALL, limitby=(start_idx, end_idx + 1), orderby=~db.post.id)

    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            m = dict(
                id = r.id,
                user_email = r.user_email,
                user_name = db(db.auth_user.email == r.user_email).select(db.auth_user.first_name).first().first_name + " " + db(db.auth_user.email == r.user_email).select(db.auth_user.last_name).first().last_name,
                content = r.cont,
                date = r.updated_on
            )
            posts.append(m)
        else:
            has_more = True
    logged_in = auth.user is not None
    t = db(db.thread.id == thread_id).select(db.thread.ALL).first()
    thread_title = t.title
    thread_cate = t.category
    thread_own = t.created_by
    return response.json(dict(posts=posts, looged_in=logged_in, has_more=has_more, thread_title=thread_title, thread_cate=thread_cate, thread_own=thread_own))


def get_threads():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    threads = []
    has_more = False
    rows = db().select(db.thread.ALL, limitby=(start_idx, end_idx + 1), orderby=db.thread.id)

    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            m = dict(
                id = r.id,
                title = r.title,
                category = r.category.split(','),
                date = r.created_on
            )
            threads.append(m)
        else:
            has_more = True
    logged_in = auth.user is not None
    return response.json(dict(threads=threads, looged_in=logged_in, has_more=has_more,))


def get_user_data():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    email = request.vars.email if request.vars.email is not None else 0
    posts = []
    has_more = False
    rows = db(db.post.user_email == email).select(db.post.ALL, limitby=(start_idx, end_idx + 1), orderby=~db.post.id)

    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            m = dict(
                id = r.id,
                content = r.cont,
                date = r.updated_on
            )
            posts.append(m)
        else:
            has_more = True
    logged_in = auth.user is not None
    user_name = db(db.auth_user.email == email).select(db.auth_user.first_name).first().first_name + " " + db(
        db.auth_user.email == email).select(db.auth_user.last_name).first().last_name
    return response.json(dict(posts=posts, looged_in=logged_in, has_more=has_more, name=user_name))

@auth.requires_signature()
def add_post():
    m_id = db.post.insert(
        cont = request.vars.content,
        thread_id = request.vars.thread_id
    )

    m = db.post(m_id)
    post = dict(
        id = m.id,
        content = m.cont,
        thread_id = m.thread_id
    )
    return response.json(dict(post=post))


@auth.requires_signature()
def create_thread():
    m_id = db.thread.insert(
        title = request.vars.title,
        category = request.vars.category
    )

    m = db.thread(m_id)
    thread = dict(
        id = m.id,
        title = m.title,
        category = m.category
    )
    return response.json(dict(thread=thread))


def check_inbox():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    email = request.vars.email if request.vars.email is not None else 0
    posts = []
    has_more = False
    new_msg = False
    rows = db(db.user_msg.sent_to == email).select(db.user_msg.ALL, limitby=(start_idx, end_idx + 1), orderby=~db.user_msg.id)

    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            m = dict(
                id = r.id,
                sender_email = r.sent_from,
                sender_name = db(db.auth_user.email == r.sent_from).select(db.auth_user.first_name).first().first_name + " " + db(db.auth_user.email == r.user_email).select(db.auth_user.last_name).first().last_name,
                msg = r.msg,
                date = r.sent_on,
                is_read = r.is_read
            )
            posts.append(m)
            if r.is_read:
                new_msg = True
        else:
            has_more = True

    return response.json(dict(msgs=posts, has_more=has_more, new_msg=new_msg))