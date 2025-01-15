--query 1: Tony Stark Insert
--query 2: Tony Stark update
--query 3: Tony Startk Delete
--query 4: Description Update







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