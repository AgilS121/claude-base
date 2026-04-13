# Yii 1.x Stack Profile

> Berlaku untuk: simlab-tuv-v1, simlab-enviro-tuv-v1

## Sumber Referensi
- Yii 1.1 official docs (yiiframework.com/doc/guide/1.1)
- Legacy PHP patterns (PHP 5.x-7.x era)

---

## Architecture

```
Browser → index.php → CWebApplication → Controller (actionXxx) → Model (CActiveRecord) → MySQL
                                       ↘ View (protected/views/{controller}/{action}.php)
```

### Key Directories
```
protected/
├── config/
│   ├── main.php          ← Konfigurasi utama (db, urlManager, components)
│   └── dev_config.php    ← Override untuk development
├── controllers/          ← Controller classes
├── models/               ← CActiveRecord models
├── views/
│   ├── {controller}/     ← Views per controller
│   └── layouts/          ← Layout templates
├── components/           ← Application components
├── extensions/           ← Third-party extensions
├── runtime/              ← Cache, logs (jangan commit)
└── data/                 ← SQL schema, fixtures
```

---

## Model Pattern (CActiveRecord)

```php
class Order extends CActiveRecord
{
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    public function tableName()
    {
        return 'tbl_order'; // atau 'order'
    }

    public function rules()
    {
        return array(
            array('field1, field2', 'required'),
            array('field3', 'numerical'),
            array('field4', 'length', 'max' => 255),
        );
    }

    public function relations()
    {
        return array(
            'customer' => array(self::BELONGS_TO, 'Customer', 'customer_id'),
            'items' => array(self::HAS_MANY, 'OrderItem', 'order_id'),
        );
    }

    public function attributeLabels()
    {
        return array(
            'id' => 'ID',
            'customer_id' => 'Customer',
        );
    }
}
```

---

## Controller Pattern

```php
class OrderController extends CController
{
    public function accessRules()
    {
        return array(
            array('allow', 'actions' => array('index', 'view'), 'users' => array('@')),
            array('deny', 'users' => array('*')),
        );
    }

    public function actionIndex()
    {
        $criteria = new CDbCriteria();
        $criteria->condition = 'status = :status';
        $criteria->params = array(':status' => 1);
        $criteria->order = 'created_at DESC';

        $dataProvider = new CActiveDataProvider('Order', array(
            'criteria' => $criteria,
            'pagination' => array('pageSize' => 20),
        ));

        $this->render('index', array('dataProvider' => $dataProvider));
    }

    public function actionCreate()
    {
        $model = new Order;
        if (isset($_POST['Order'])) {
            $model->attributes = $_POST['Order'];
            if ($model->save()) {
                $this->redirect(array('view', 'id' => $model->id));
            }
        }
        $this->render('create', array('model' => $model));
    }
}
```

---

## DB Query Patterns

```php
// Find by primary key
$order = Order::model()->findByPk($id);

// Find by attributes
$order = Order::model()->findByAttributes(array('code' => $code));

// Find all with criteria
$criteria = new CDbCriteria();
$criteria->addCondition('status = :status');
$criteria->params[':status'] = 1;
$orders = Order::model()->findAll($criteria);

// Count
$count = Order::model()->count($criteria);

// Raw SQL (gunakan parameter binding!)
$sql = "SELECT * FROM tbl_order WHERE status = :status";
$orders = Yii::app()->db->createCommand($sql)
    ->bindParam(':status', $status)
    ->queryAll();
```

---

## View & Widget Patterns

```php
// CGridView — tabel data dengan sorting & pagination
$this->widget('zii.widgets.grid.CGridView', array(
    'dataProvider' => $dataProvider,
    'columns' => array(
        'id',
        'customer.name',  // relasi
        array('name' => 'status', 'value' => '$data->getStatusLabel()'),
        array('class' => 'CButtonColumn'),
    ),
));

// CListView — list view custom
$this->widget('zii.widgets.CListView', array(
    'dataProvider' => $dataProvider,
    'itemView' => '_item',
));

// Form
$form = $this->beginWidget('CActiveForm', array(
    'id' => 'order-form',
    'enableAjaxValidation' => false,
));
echo $form->textField($model, 'name');
echo $form->dropDownList($model, 'status', $statusOptions);
$this->endWidget();
```

---

## URL Routing

```php
// config/main.php
'urlManager' => array(
    'urlFormat' => 'path',
    'rules' => array(
        '<controller:\w+>/<id:\d+>' => '<controller>/view',
        '<controller:\w+>/<action:\w+>/<id:\d+>' => '<controller>/<action>',
        '<controller:\w+>/<action:\w+>' => '<controller>/<action>',
    ),
),
```

---

## Known Gotchas

### Tidak Ada Migration System
- Yii 1 TIDAK punya migration bawaan yang konsisten
- Perubahan DB biasanya langsung SQL
- JANGAN assume ada migration file — cek langsung di DB atau model

### Legacy PHP Patterns
- `array()` bukan `[]` (PHP 5.3 compatible)
- `$_POST`, `$_GET` masih sering dipakai langsung
- Tidak ada type hints di banyak tempat
- Global functions dan static methods umum

### Security
- `accessRules()` di controller → WAJIB ada
- CSRF token: `Yii::app()->request->enableCsrfValidation`
- SQL injection: SELALU pakai parameter binding di CDbCriteria atau createCommand
- XSS: pakai `CHtml::encode()` di view

### Extension & Component
- Extensions di `protected/extensions/` — bisa custom atau third-party
- Components di `protected/components/` — base classes, helpers
- Cek `config/main.php` untuk component yang di-register

---

## Anti-Patterns (JANGAN pakai)

| Salah | Benar | Alasan |
|---|---|---|
| `$_POST['field']` langsung tanpa sanitize | `$model->attributes = $_POST['Model']` + `rules()` | Mass assignment + validation |
| Raw SQL tanpa binding | CDbCriteria dengan params atau bindParam | SQL injection |
| Skip `accessRules()` | Selalu define access rules | Auth bypass |
| `echo` langsung di controller | `$this->render('view', $data)` | MVC violation |
| Modify `runtime/` files manually | Biarkan framework manage | Cache corruption |

---

## Business-Specific Rules (Tim DTIT)

- **SIMLab-TUV-V1 = maintenance mode** → jangan ubah struktur, minimal change only
- **SIMLab-Enviro-TUV-V1 = active** tapi tetap legacy → hati-hati dengan side effects
- Jangan ubah DB schema tanpa konfirmasi — tidak ada migration untuk rollback
- Theme system mungkin aktif (`themes/` folder) — cek sebelum edit view
- Beberapa query mungkin pakai raw SQL — trace dengan hati-hati
