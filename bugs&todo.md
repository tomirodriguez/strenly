Program Grid
- ctrl + g shortcut create a superset but it doesn't toggle the exercise out. 
- cant reorder exercises inside a superset
- Grid UI is a bit broken with borders and z-indexes.
  - superset indicator is a bit off to the top
  - the outline of the selected cell sometimes is seen behind other elements
  - focus en las cells no funciona bien. Si me muevo a las ultimas celdas funciona perfecto: se hace scroll para que se vea toda la celda, pero si vuelvo para atras, no se scrollea correctamente si me paro en una celda que queda detras del ejercicio (el cual esta fixed). En esos casos tambien se deberia scrollear para que la celda no tenga ninguna parte por detras del ejercicio o las columnas fixed
- the layout looks a bit off caused by the padding in the main layout
- breadcrumb is showing the id of the program, and lost the paths. Its just "Inicio > Ef563024-b8ef-47f4-a9c8-92ef6b1b0df4"
- Pairing / Exercise Selection en la columna esta en ingles y queda mal. Basta con ejercicio
- Add keyboard shortcuts to add a week, remove a week, add a day (+  focus there), remove day (context of where im at), rename day (same)
- delete week is still calling the backend service. It is supposed to be all client side.
- add some options on the day row to edit the name and delete the day maybe. Even moving down (nite to have)
- The summary of weeks and sessions at the top of the grid is not updating when adding weeks and sessions
- The "Guardado" tag doesn't change when we have pending things to save. is a bit confusing
- when having a warning in an invalid cell, if i step on it with the cursor, the border of the focus is on top of the warning, so i cant see the orange
- when trying to save with invalid format, the dialog seems to be extra thing so the save button text is cutted

Program list
- We need a way to access the program editor without the action. Maybe the default action when clicking the name

Program creation
- audit the form. Should we have templates when we dont have ?
- The for UI is enormous. It makes the user scroll a lot. We need to make it more friendly, having some fields closers and maybe other order. We need to review it with /frontend-design maybe