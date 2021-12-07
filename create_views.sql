/*
 SQL file to create views
 */

use myforum;

# Reset the view if it exists already
drop view if exists view_posts;

# Initialise the view
create view view_posts as
    select      post_id, p.post_date, t.topic_title, p.post_title, p.post_content, u.username, p.user_id, p.topic_id
    from        posts p
    join        topics t
    on          p.topic_id = t.topic_id
    join        users u
    on          p.user_id = u.user_id
    order by    post_date desc;