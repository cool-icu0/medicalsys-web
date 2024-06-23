<template>
	<div>
		<div class="search">
			<el-input placeholder="请输入标题查询" style="width: 200px" v-model="searchkey"></el-input>
			<!-- <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button> -->
			<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
			<el-button type="primary" plain @click="handleAdd()">新增</el-button>
		</div>

		<div class="table">
			<el-table :data="topicCompute" stripe @selection-change="handleSelectionChange">
				<!--        <el-table-column type="selection" width="55" align="center"></el-table-column> -->
				<el-table-column prop="topicId" label="标题ID" width="80" align="center" sortable></el-table-column>
				<el-table-column prop="title" label="标题" show-overflow-tooltip></el-table-column>
				<el-table-column prop="content" label="内容" show-overflow-tooltip></el-table-column>
				<el-table-column :formatter="formatDate" prop="createDate" label="创建时间"></el-table-column>
				<el-table-column prop="userId" label="发布者"></el-table-column>
				<el-table-column label="操作" width="180" align="center">
					<template v-slot="scope">
						<el-button plain type="primary" @click="handleEdit(scope.row)" size="mini">编辑</el-button>
						<!-- <el-button plain type="danger" size="mini" @click=del(scope.row.id)>删除</el-button> -->
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination">
				<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
					:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
				</el-pagination>
			</div>
		</div>


		<el-dialog title="信息" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
			<el-form label-width="100px" style="padding-right: 50px" :model="form" :rules="rules" ref="formRef">
				<el-form-item prop="title" label="标题">
					<el-input v-model="form.title" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item prop="content" label="内容">
					<el-input type="textarea" :rows="5" v-model="form.content" autocomplete="off"></el-input>
				</el-form-item>
				<el-row>
					<el-col :span="12">
						<div><el-form-item prop="userId" label="用户ID">
								<el-input v-model="form.userId" autocomplete="off" disabled></el-input>
							</el-form-item></div>
					</el-col>
					<el-col :span="12">
						<div><el-form-item prop="createDate" label="发布时间">
								<el-input v-model="form.createDate" autocomplete="off" disabled></el-input>
							</el-form-item></div>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="fromVisible = false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</div>
		</el-dialog>


	</div>
</template>

<script>
	export default {
		name: "Notice",
		data() {
			return {
				nowDate: null,
				nowtimer: "",
				searchkey: '',
				tableData: [], // 所有的数据
				pageNum: 1, // 当前的页码
				pageSize: 8, // 每页显示的个数
				total: 0,
				title: null,
				fromVisible: false,
				form: {},
				userId: JSON.parse(localStorage.getItem('xm-user')).userId,
				rules: {
					title: [{
						required: true,
						message: '请输入标题',
						trigger: 'blur'
					}, ],
					content: [{
						required: true,
						message: '请输入内容',
						trigger: 'blur'
					}, ]
				},
				ids: []
			}
		},
		computed: {
			topicCompute: function() {
				return this.tableData.filter(item => {
					return item.title.includes(this.searchkey)
				})
			}
		},
		created() {
			this.nowtimer = setInterval(this.gettime, 1000); //一个定时器，定时读取获取当前时间的方法，每秒触发一次
		},
		mounted() {
			this.fetchTopic();
		},
		methods: {
			fetchTopic() {
				this.$request.get(`/api/v1/topic/allTopicPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
					.then(res => {
						console.log(res);
						this.tableData = res.data?.list
						this.total = res.data?.total
					})
			},
			handleAdd() { // 新增数据
				this.form = {} // 新增数据的时候清空数据
				this.form.userId = this.userId
				this.form.createDate = this.nowDate
				this.fromVisible = true // 打开弹窗
			},
			handleEdit(row) { // 编辑数据
				this.form = JSON.parse(JSON.stringify(row)) // 给form对象赋值  这里是深拷贝数据
				delete this.form.userId
				delete this.form.createDate
				this.form.userId = this.userId
				this.form.createDate = this.nowDate
				this.fromVisible = true // 打开弹窗
				this.fetchTopic()
			},
			save() { // 确定按钮触发的逻辑  它会触发新增或者更新
				// this.$refs.formRef.validate((valid) => {
				//   if (valid) {
				this.$request({
					url: this.form.topicId ? '/api/v1/topic/updateTopic' : '/api/v1/topic/insertTopic',
					method: this.form.topicId ? 'POST' : 'POST',
					data: this.form
				}).then(res => {
					if (res.code == 200) { // 表示成功保存
						this.$message.success('保存成功')
						this.load()
						this.fromVisible = false
					} else {
						this.$message.error(res.msg) // 弹出错误的信息
					}
				})
				//   }
				// })
			},
			del(id) { // 单个删除
				this.$confirm('您确定删除吗？', '确认删除', {
					type: "warning"
				}).then(response => {
					this.$request.delete('/notice/delete/' + id).then(res => {
						if (res.code === '200') { // 表示操作成功
							this.$message.success('操作成功')
							this.load(1)
						} else {
							this.$message.error(res.msg) // 弹出错误的信息
						}
					})
				}).catch(() => {})
			},
			gettime() {
				const now = new Date();
				const year = now.getFullYear(); // 获取四位数年份
				const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以+1，并确保两位数
				const day = now.getDate().toString().padStart(2, '0'); // 确保天为两位数

				this.nowDate = `${year}-${month}-${day}`; //T${hours}:${minutes}:${seconds}.${milliseconds}+08:00
			},
			formatDate(row, column) {
				const value = row[column.property];
				if (!value) return '';

				const date = new Date(value);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');

				return `${year}-${month}-${day}`; // 返回 "xxxx-xx-xx"
			},

			// handleSelectionChange(rows) {   // 当前选中的所有的行数据
			//   this.ids = rows.map(v => v.id)   //  [1,2]
			// },
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/topic/allTopicPager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
						title: this.title,
					}
				}).then(res => {
					this.tableData = res.data?.list
					this.total = res.data?.total
				})
			},
			reset() {
				this.searchkey = ""
			},
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
		}
	}
</script>

<style scoped>

</style>