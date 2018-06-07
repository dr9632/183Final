# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime


def get_user_email():
    return auth.user.email if auth.user else None


db.define_table('post',
                Field('user_email', default=get_user_email()),
                Field('cont', 'text'),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('thread_id', 'integer'),
                Field('is_closed', 'boolean', default=False)
                )

db.define_table('thread',
                Field('title', 'text'),
                Field('category', 'text'),
                Field('created_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('created_by', default=get_user_email())
                )

db.post.user_email.writable = False
db.post.user_email.readable = False
db.post.updated_on.writable = db.post.updated_on.readable = False
db.post.id.writable = db.post.id.readable = False
db.post.thread_id.writable = db.post.thread_id.readable = False

db.thread.created_on.writable = db.thread.created_on.readable = False
db.thread.id.writable = db.thread.id.readable = False
db.thread.id.writable = db.thread.id.readable = False
db.post.user_email.writable = db.post.user_email.readable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
