/*
 SQL file to create the stored procedures
 */

use myforum;

# If a procedure called insert_post exists, delete it and make a new one
drop procedure if exists insert_post;

delimiter //
create procedure insert_post (
	in p_post_title     varchar(30),
	in p_post_content   mediumtext,
	in p_topic_title    varchar(20),
	in p_username       varchar(15)
)
begin
	declare v_user_id int;
	declare v_topic_id int;
	declare v_memberof int;

	# Get user_id from form username
	select  user_id
	from    users
	where   username = p_username
    into    v_user_id;

	if isnull(v_user_id) then
		signal sqlstate '45000' set message_text = 'No matching username found';
	end if;

	# Get topic_id from form topic title
	select  topic_id
	from    topics
	where   topic_title = p_topic_title
    into    v_topic_id;

	if isnull(v_topic_id) then
		signal sqlstate '45000' set message_text = 'No matching topic found';
	end if;

	# Check that user is a member of topic
    select  count(*)    as  countmembership
    from    membership
    where   user_id = v_user_id and topic_id = v_topic_id
    into    v_memberof;

	if v_memberof = 0 then
		signal sqlstate '45000' set message_text = 'User is not a member of that topic';
	end if;

	# Insert user data into user table now that all three checks have passed
    insert into posts (post_date, post_title, post_content, user_id, topic_id)
    values (now(), p_post_title, p_post_content, v_user_id, v_topic_id);
end //
delimiter ;