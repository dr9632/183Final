# Here go your api methods.


def get_posts():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    thread_id = int(request.vars.thread_id) if request.vars.end_idx is not None else 0
    posts = []
    has_more = False
    rows = db(db.post.thread_id == thread_id).select(db.post.ALL, limitby=(start_idx, end_idx + 1), orderby=~db.post.id)

    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            m = dict(
                id = r.id,
                user_name = db(db.auth_user.email == r.user_email).select(db.auth_user.first_name).first().first_name + " " + db(db.auth_user.email == r.user_email).select(db.auth_user.last_name).first().last_name,
                content = r.cont,
                date = r.updated_on
            )
            posts.append(m)
        else:
            has_more = True
    logged_in = auth.user is not None
    return response.json(dict(posts=posts, looged_in=logged_in, has_more=has_more,))


@auth.requires_signature()
def add_post():
    m_id = db.checklist.insert(
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


@auth.requires_signature()
def del_memo():
    db(db.checklist.id == request.vars.memo_id).delete()
    return "ok"


@auth.requires_signature()
def edit_memo():
    memo = db(db.checklist.id == request.vars.id).select().first()
    memo.update_record(title=request.vars.title)
    memo.update_record(memo=request.vars.memo)

    return dict()


@auth.requires_signature()
def toggle_public():
    cl = db(db.checklist.id == request.vars.memo_id).select().first()
    cl.update_record(is_public=not cl.is_public)
    return "ok"
