@GrabResolver(name = 'walmart', root = 'https://repository.walmart.com/nexus/content/groups/public')
@Grab(group='org.apache.commons', module='commons-lang3', version='3.7')
import org.apache.commons.lang3.RandomStringUtils

println RandomStringUtils.random(10)