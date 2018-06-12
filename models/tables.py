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
                Field('created_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('thread_id', 'integer')
                )

db.define_table('thread',
                Field('title', 'text'),
                Field('category', 'text'),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('created_by', default=get_user_email()),
                Field('team_list', 'text', default=get_user_email()),
                Field('is_closed', 'boolean', default=False),
                Field('is_private', 'boolean', default=False)
                )

db.define_table('user_msg',
                Field('sent_from', default=get_user_email()),
                Field('sent_to', 'string'),
                Field('sent_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('msg', 'text'),
                Field('is_read', 'boolean', default=False)
                )

db.post.user_email.writable = False
db.post.user_email.readable = False
db.post.created_on.writable = db.post.created_on.readable = False
db.post.id.writable = db.post.id.readable = False
db.post.thread_id.writable = db.post.thread_id.readable = False

db.thread.updated_on.writable = db.thread.updated_on.readable = False
db.thread.id.writable = db.thread.id.readable = False
db.thread.created_by.writable = db.thread.created_by.readable = False
db.thread.is_closed.writable = db.thread.is_closed.readable = False
db.thread.is_private.writable = db.thread.is_private.readable = False

db.user_msg.sent_on.writable = db.user_msg.sent_on.readable = False
db.user_msg.id.writable = db.user_msg.id.readable = False
db.user_msg.sent_from.writable = db.user_msg.sent_from.readable = False
db.user_msg.sent_to.writable = db.user_msg.sent_to.readable = False
db.user_msg.is_read.writable = db.user_msg.is_read.readable = False

# after defining tables, uncomment below to enable auditing
auth.enable_record_versioning(db)
