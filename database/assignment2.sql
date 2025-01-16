--query 1: Tony Stark Insert
INSERT INTO public.account(
	account_fistname,
	account_lastname,
	account_email,
	account_password
)
VALUES (
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronM@n'
)

--query 2: Tony Stark update
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 2;

--query 3: Tony Startk Delete

DELETE FROM public.account
WHERE account_id = 2; --if there is only one row inthe table, then just clear the table using DELETE FROM public.account;

--query 4: Description Update
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id= 10;


--query 5: Select with inner join
SELECT 
	public.inventory.inv_make,
	public.inventory.inv_model,
	public.classification.classification_name
	
FROM
	public.inventory
INNER JOIN
	public.classification
ON
	inventory.classification_id = classification.classification_id
WHERE
	classification.classification_name = 'Sport';

--query 6: image path update
UPDATE public.inventory
SET 
	inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
	inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles');
